"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AtSign, User } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUsername?: string;
  defaultTwitterHandle?: string;
  defaultBio?: string;
  onSave: (data: {
    username: string;
    twitterHandle: string;
    bio: string;
  }) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  isOpen,
  onClose,
  defaultUsername = "",
  defaultTwitterHandle = "",
  defaultBio = "",
  onSave,
}) => {
  const [username, setUsername] = useState(defaultUsername);
  const [twitterHandle, setTwitterHandle] = useState(defaultTwitterHandle);
  const [bio, setBio] = useState(defaultBio);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setUsername(defaultUsername);
    setTwitterHandle(defaultTwitterHandle);
    setBio(defaultBio);
  }, [defaultUsername, defaultTwitterHandle, defaultBio, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      await new Promise((resolve) => setTimeout(resolve, 500));

      onSave({
        username,
        twitterHandle,
        bio,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Display Name</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                placeholder="Your display name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter Handle</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <AtSign className="h-4 w-4" />
              </div>
              <Input
                id="twitter"
                value={twitterHandle}
                onChange={(e) =>
                  setTwitterHandle(e.target.value.replace("@", ""))
                }
                className="pl-10"
                placeholder="Your Twitter handle (without @)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself"
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
