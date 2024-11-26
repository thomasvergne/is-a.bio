import { SettingsIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Link, useNavigate } from "@remix-run/react";
import { useRef, useState } from "react";
import { Block, Settings } from "../blocks";

interface NavigationProps {
  setBlocks: (blocks: Block[]) => void;
  setSettings: (settings: Settings) => void;
  settings: Settings;
  action: 'edit' | 'preview';
}

export function Navigation({ setBlocks, setSettings, settings, action }: NavigationProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState<Settings['size']>(settings.size);
  const navigate = useNavigate();

  return <>
    <nav className="py-4 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-4 gap-4">
        <span className="relative inline-flex max-md:justify-center mx-auto py-2 px-4 bg-primary text-primary-foreground w-max rounded-lg font-black">
          is-a.bio
        </span>

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

                <Select onValueChange={(value) => setSize(value as Settings['size'])} defaultValue="small">
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
                  setBlocks([]);
                  setSettings({ title: 'Untitled portfolio', size: 'small', description: '' });

                  navigate('/builder/new');
                }}>
                  Reset portfolio
                </Button>
                <div className="flex gap-x-2 max-md:w-full">
                  <DialogClose asChild className="max-md:w-full">
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button className="max-md:w-full" onClick={() => {
                    setSettings({
                      title: nameInputRef.current?.value ?? settings.title,
                      description: descriptionInputRef.current?.value ?? settings.description,
                      size,
                    })
                  }}>Save changes</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" asChild>
            <Link to={action === 'preview' ? '/builder/preview' : '/builder'}>
              {action === 'preview' ? 'Preview the portfolio' : 'Edit the portfolio'}
            </Link>
          </Button>

          <Button>
            Publish
          </Button>
        </div>
      </div>
    </nav>
    <hr />
  </>
}