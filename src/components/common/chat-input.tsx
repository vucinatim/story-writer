import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const userMessageSchema = z.object({
  content: z.string().min(1, "Message must be at least 1 character"),
});

export type UserMessage = z.infer<typeof userMessageSchema>;

export interface ChatInputRef {
  setValue: (value: string) => void;
}

interface ChatInputProps {
  initialValue?: string | null;
  onSubmit: (message: UserMessage) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  isGenerating?: boolean;
}

/**
 * ChatInput Component - Supports external ref control for setting value.
 */
const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  ({ initialValue, onSubmit, onChange, placeholder, isGenerating }, ref) => {
    const form = useForm({
      resolver: zodResolver(userMessageSchema),
      defaultValues: { content: initialValue ?? "" },
    });

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Function to adjust textarea height dynamically
    const adjustHeight = () => {
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto"; // Reset height
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px"; // Grow up to 150px
      }, 0);
    };

    // Handle external ref actions
    useImperativeHandle(ref, () => ({
      setValue: (value: string) => {
        console.log("🚀 SET VALUE", value);
        form.setValue("content", value);
        adjustHeight();
      },
    }));

    // Listen to form changes and notify parent
    useEffect(() => {
      const { unsubscribe } = form.watch((value) => {
        onChange?.(value.content ?? "");
      });
      return () => unsubscribe();
    }, [form, onChange]);

    // Reset form when initialValue changes
    useEffect(() => {
      form.reset({ content: initialValue ?? "" });
      adjustHeight();
    }, [form, initialValue]);

    useEffect(() => {
      adjustHeight(); // Adjust height on mount
    }, []);

    // Handle submission
    const handleSubmit = (values: z.infer<typeof userMessageSchema>) => {
      onSubmit(values);
      form.reset({ content: "" });
      adjustHeight(); // Reset height after submit
    };

    return (
      <div className="bg-zinc-100 w-full p-4 rounded-3xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="relative flex w-full gap-2"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={(el) => {
                        field.ref(el);
                        textareaRef.current = el; // Attach ref for height adjustment
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(handleSubmit)();
                        }
                      }}
                      onInput={adjustHeight}
                      placeholder={placeholder || "Ask the AI..."}
                      className={cn(
                        "w-full resize-none pr-14 bg-transparent border-none shadow-none focus-visible:outline-none focus-visible:ring-transparent"
                      )}
                      rows={1} // Start with 1 row
                      style={{
                        minHeight: "32px",
                        maxHeight: "150px",
                        overflowY: "auto",
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isGenerating}
              size="icon"
              className="absolute right-2 top-2 rounded-full bg-zinc-400"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </form>
        </Form>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput"; // Required for forwardRef components

export default ChatInput;
