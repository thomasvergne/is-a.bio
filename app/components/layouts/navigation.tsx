import { Edit, Eye, MessageCircleWarning, SettingsIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Link } from "@remix-run/react";
import { useRef, useState } from "react";
import { UserData } from "~/session.server";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { SidebarTrigger } from "../ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Block, Settings } from "../types";

export function MainNavigation({ user }: { user: UserData | null }) {
  return <nav className="py-16 lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto w-full grid grid-cols-4">
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
  onDelete: () => void;
  actionData: { status: number; message: string } | undefined;
}

export function Navigation({ actionData, onDelete, name, onSave, published, setSettings, settings, action }: NavigationProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState<Settings['size']>(settings.size);

  return <>
    <nav className="grid grid-cols-2 gap-8 py-8">
      <div className="col-span-1 w-full">
        <SidebarTrigger className="lg:hidden" />
        {actionData?.message && (
          <Alert variant="destructive" className="block">
            <MessageCircleWarning className="w-5 h-5 mr-2" />

            <AlertTitle>
              An error occured while saving the portfolio
            </AlertTitle>
            <AlertDescription>
              {actionData.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="flex items-center justify-end gap-2">
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
              <Label className="block">
                General settings
              </Label>

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
              
              <Label className="mt-4 block">
                Your portfolio icon
              </Label>

              <Input ref={fileInputRef} type="file" id="portfolio-icon" name="portfolio-icon" className="mt-2" />
            </div>

            <DialogFooter className="w-full flex md:!justify-between gap-2">
              <Button variant="destructive" onClick={onDelete}>
                Delete portfolio
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
                    favicon: fileInputRef.current?.files?.[0] ?? settings.favicon,
                  });

                  return onSave?.call(null, e);
                }}>Save changes</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" asChild>
          <Link to={action === 'preview' ? `/builder/${name}/preview` : `/builder/${name}`}>
            {
              action === 'preview'
                ? <Eye />
                : <Edit />
            }
          </Link>
        </Button>

        <Button 
          variant="outline"
          onClick={(e) => {
            setSettings({
              title: nameInputRef.current?.value ?? settings.title,
              description: descriptionInputRef.current?.value ?? settings.description,
              size,
              favicon: fileInputRef.current?.files?.[0] ?? settings.favicon,
            });

            return onSave?.call(null, e);
          }}
        >
          Save content
        </Button>

        <Button asChild>
          <Link to={published ? `/builder/${name}/unpublish` : `/builder/${name}/publish`}>
            {published ? 'Unpublish the portfolio' : 'Publish the portfolio'}
          </Link>
        </Button>
      </div>
    </nav>
  </>
}