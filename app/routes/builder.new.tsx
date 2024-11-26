import { useNavigate } from "@remix-run/react";
import { useRef } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Settings } from "~/components/blocks";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export default function BuilderNew() {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const [_, setSettings] = useLocalStorage<Settings>("settings", { title: 'Untitled portfolio', size: 'small', description: '' });

  return (
    <main className="min-h-screen bg-slate-100 grid place-items-center">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Create a new portfolio
            </CardTitle>

            <CardDescription>
              Get starting by creating a new portfolio. Fill out the form below to start building your portfolio.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4">
              <div>
                <Label>
                  The portfolio name
                </Label>

                <Input ref={nameInputRef} type="text" placeholder="Enter the name of your portfolio" className="mt-2" />
              </div>

              <div>
                <Label>
                  The portfolio description
                </Label>

                <Textarea ref={descriptionInputRef} placeholder="Enter the description of your portfolio" className="mt-2" rows={3} />
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button onClick={() => {
              const title = nameInputRef.current?.value;
              const description = descriptionInputRef.current?.value;

              if (!title || !description) {
                return
              }

              setSettings({ title, description, size: 'small' });

              navigate('/builder');
            }}>Start building your portfolio</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}