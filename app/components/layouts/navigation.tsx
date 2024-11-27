import { SettingsIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Link } from "@remix-run/react";
import { useRef, useState } from "react";
import { Block, Settings } from "../blocks";
import { UserData } from "~/session.server";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function MainNavigation({ user }: { user: UserData | null }) {
  return <nav className="py-16 max-w-7xl mx-auto w-full grid grid-cols-4">
    <Link to="/" className="relative max-md:inline-flex max-md:justify-center max-md:mx-auto">
      <img src="/logo.svg" className="w-24 h-auto" alt="" />
    </Link>

    <div className="col-span-3 justify-self-end gap-x-2 flex flex-row items-center">
      {
        user
          ? <>
            <Button asChild>
              <Link to="/builder">
                View your websites
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {user.username}

                  <img src={user.avatarURL} alt={user.email} className="w-6 h-6 rounded-full" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent> 

                <DropdownMenuItem asChild>
                  <Link to="/logout">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
          : <>
            <Button variant="outline" asChild>
              <Link to="/login">
                Login to your account
              </Link>
            </Button>
            <Button asChild>
              <Link to="/builder/new">
                Start building your website
              </Link>
            </Button>
          </>
      }
    </div>
  </nav>
}

interface NavigationProps {
  setBlocks: (blocks: Block[]) => void;
  setSettings: (settings: Settings) => void;
  settings: Settings;
  action: 'edit' | 'preview';
  name: string;
  published: boolean;
  onSave?: React.MouseEventHandler<HTMLButtonElement>;
}

export function Navigation({ name, onSave, published, setSettings, settings, action }: NavigationProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState<Settings['size']>(settings.size);

  return <>
    <nav className="py-4 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-4 gap-4">
        <Link to="/" className="relative max-md:inline-flex max-md:justify-center max-md:mx-auto">
          <img src="/logo.svg" className="w-24 h-auto" alt="" />
        </Link>

        <div className="md:col-span-3 justify-self-center md:justify-self-end self-center flex items-center md:justify-end flex-row gap-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <SettingsIcon />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Portfolio settings
                </DialogTitle>

                <DialogDescription>
                  Change the settings of your portfolio, such as the name, description, width, and more.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <Input ref={nameInputRef} defaultValue={settings.title} type="text" placeholder="Enter the name of your portfolio" className="mt-2" />
                <Input ref={descriptionInputRef} defaultValue={settings.description} type="text" placeholder="Enter the description of your portfolio" className="mt-2 mb-2" />

                <Select onValueChange={(value) => setSize(value as Settings['size'])} defaultValue={settings.size}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set the width of your portfolio" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="small">
                      Small (default: 768px)
                    </SelectItem>

                    <SelectItem value="medium">
                      Medium (1024px)
                    </SelectItem>

                    <SelectItem value="large">
                      Large (1280px)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="w-full flex md:!justify-between gap-2">
                <Button variant="destructive" onClick={() => {

                }}>
                  Reset portfolio
                </Button>
                <div className="flex gap-x-2 max-md:w-full">
                  <DialogClose asChild className="max-md:w-full">
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button className="max-md:w-full" onClick={(e) => {
                    setSettings({
                      title: nameInputRef.current?.value ?? settings.title,
                      description: descriptionInputRef.current?.value ?? settings.description,
                      size,
                    });

                    return onSave?.call(null, e);
                  }}>Save changes</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={onSave}>
            Save changes
          </Button>

          <Button variant="outline" asChild>
            <Link to={action === 'preview' ? `/builder/preview/${name}` : `/builder/${name}`}>
              {action === 'preview' ? 'Preview the portfolio' : 'Edit the portfolio'}
            </Link>
          </Button>

          <Button asChild>
            <Link to={published ? `/builder/unpublish/${name}` : `/builder/publish/${name}`}>
              {published ? 'Unpublish the portfolio' : 'Publish the portfolio'}
            </Link>
          </Button>
        </div>
      </div>
    </nav>
    <hr />
  </>
}