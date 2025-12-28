/**
 * Share Recipe Dialog Component
 *
 * Features:
 * - Share recipe via email
 * - Email validation
 * - Optional message
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback } from "react";
import { useShareRecipeEmail } from "../../hooks/useEmailSharing";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Share2, Mail } from "lucide-react";
import { Recipe } from "../../types";

interface ShareRecipeDialogProps {
  recipe: Recipe;
  trigger?: React.ReactNode;
}

/**
 * Share Recipe Dialog Component (Memoized for performance)
 *
 * Allows users to share recipes via email
 */
const ShareRecipeDialog = memo(({ recipe, trigger }: ShareRecipeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");

  const shareEmail = useShareRecipeEmail();

  const handleShare = useCallback(() => {
    if (!recipientEmail.trim()) {
      return;
    }

    shareEmail.mutate(
      {
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        recipeImage: recipe.image,
        recipientEmail: recipientEmail.trim(),
        senderName: senderName.trim() || undefined,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setRecipientEmail("");
          setSenderName("");
          setMessage("");
        },
      }
    );
  }, [recipe, recipientEmail, senderName, message, shareEmail]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="inline-flex items-center gap-2"
            aria-label="Share recipe via email"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Share Recipe
          </DialogTitle>
          <DialogDescription>
            Share &quot;{recipe.title}&quot; with a friend via email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="recipient-email" className="text-sm font-medium">
              Recipient Email <span className="text-red-400">*</span>
            </label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="bg-slate-900/30 backdrop-blur-sm border-slate-400/30 text-white rounded-xl"
              aria-label="Recipient email address"
              aria-required="true"
            />
            {recipientEmail && !isValidEmail && (
              <p className="text-xs text-red-400">Please enter a valid email address</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="sender-name" className="text-sm font-medium">
              Your Name (Optional)
            </label>
            <Input
              id="sender-name"
              type="text"
              placeholder="Your name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="bg-slate-900/30 backdrop-blur-sm border-slate-400/30 text-white rounded-xl"
              aria-label="Your name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message (Optional)
            </label>
            <Textarea
              id="message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-slate-900/30 backdrop-blur-sm border-slate-400/30 text-white min-h-[100px] rounded-xl"
              aria-label="Personal message"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handleShare}
              disabled={!isValidEmail || shareEmail.isPending}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500/70 via-emerald-500/50 to-emerald-500/30 px-4 py-2 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(16,185,129,0.45)] transition duration-200 hover:border-emerald-300/40 hover:from-emerald-500/80 hover:via-emerald-500/60 hover:to-emerald-500/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              aria-label={shareEmail.isPending ? "Sending email" : "Send email"}
            >
              <Mail className="h-4 w-4 mr-2" />
              {shareEmail.isPending ? "Sending..." : "Send Email"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-gradient-to-r from-slate-500/70 via-slate-500/50 to-slate-500/30 px-4 py-2 text-sm font-semibold text-white/60 shadow-[0_15px_35px_rgba(71,85,105,0.25)] transition duration-200 hover:border-slate-300/40 hover:from-slate-500/80 hover:via-slate-500/60 hover:to-slate-500/40 backdrop-blur-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ShareRecipeDialog.displayName = "ShareRecipeDialog";

export default ShareRecipeDialog;

