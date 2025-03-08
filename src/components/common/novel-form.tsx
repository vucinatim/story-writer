"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  genres,
  writingStyles,
  perspectives,
  storyLengths,
} from "@/lib/novel-options";
import { MultiSelect } from "@/components/ui/multi-select";
import CharacterForm from "@/components/common/character-form";
import {
  Novel,
  UpdateNovelConfig,
  UpdateNovelConfigSchema,
} from "@/lib/schemas";
import { useNovelStore } from "@/lib/stores/novels-store";
import { useEffect } from "react";
import { Textarea } from "../ui/textarea";

interface NovelFormProps {
  novel: Novel;
}

export default function NovelForm({ novel }: NovelFormProps) {
  const updateNovel = useNovelStore((state) => state.updateNovel);

  const form = useForm<UpdateNovelConfig>({
    resolver: zodResolver(UpdateNovelConfigSchema),
    defaultValues: novel?.config || {}, // Load current novel data
  });

  // If the incoming novel changes, reset the form
  useEffect(() => {
    form.reset(novel?.config);
  }, [form, novel]);

  function onSubmit(values: UpdateNovelConfig) {
    console.log("🚀 ON SUBMIT", values);
    updateNovel(novel.id, values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("FORM INVALID", errors);
        })}
        className="space-y-4"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Novel Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter novel title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Genre */}
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre(s)</FormLabel>
              <FormControl>
                <MultiSelect
                  options={[...genres]}
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Writing Style */}
        <FormField
          control={form.control}
          name="writingStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Writing Style & Tone</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Writing Style" />
                </SelectTrigger>
                <SelectContent>
                  {writingStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Perspective */}
        <FormField
          control={form.control}
          name="perspective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perspective</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Perspective" />
                </SelectTrigger>
                <SelectContent>
                  {perspectives.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Story Length */}
        <FormField
          control={form.control}
          name="storyLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Length</FormLabel>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Story Length" />
                </SelectTrigger>
                <SelectContent>
                  {storyLengths.map((length) => (
                    <SelectItem key={length} value={length}>
                      {length}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Story Premise */}
        <FormField
          control={form.control}
          name="premise"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Premise</FormLabel>
              <FormControl>
                <Textarea
                  className="h-32"
                  placeholder="Enter story premise"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Blurb */}
        <FormField
          control={form.control}
          name="blurb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Novel Blurb</FormLabel>
              <FormControl>
                <Textarea
                  className="h-32"
                  placeholder="Enter novel blurb"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Characters */}
        <FormField
          control={form.control}
          name="characters"
          render={() => <CharacterForm />}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Update Novel
        </Button>
      </form>
    </Form>
  );
}
