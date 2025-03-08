"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  personalityTypes,
  speechStyles,
  coreMotivations,
} from "@/lib/character-options";
import { UpdateNovelConfig } from "@/lib/schemas";

export default function CharacterForm() {
  const { control } = useFormContext<UpdateNovelConfig>(); // Access parent form context
  const { fields, append, remove } = useFieldArray({
    control,
    name: "characters",
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Characters</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md space-y-3">
            {/* Character Name */}
            <FormField
              control={control}
              name={`characters.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Character Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter character name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Personality */}
            <FormField
              control={control}
              name={`characters.${index}.personality`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personality</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Personality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {personalityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Speech Style */}
            <FormField
              control={control}
              name={`characters.${index}.speechStyle`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speech Style</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Speech Style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {speechStyles.map((style) => (
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

            {/* Core Motivation */}
            <FormField
              control={control}
              name={`characters.${index}.coreMotivation`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Core Motivation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Core Motivation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coreMotivations.map((motivation) => (
                        <SelectItem key={motivation} value={motivation}>
                          {motivation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Appearance */}
            <FormField
              control={control}
              name={`characters.${index}.appearance`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appearance</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Short appearance description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Character Bio */}
            <FormField
              control={control}
              name={`characters.${index}.bio`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Character Bio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Optional backstory or details"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
            >
              Remove Character
            </Button>
          </div>
        ))}

        <Button
          type="button"
          onClick={() =>
            append({
              name: "",
              personality: "",
              speechStyle: "",
              coreMotivation: "",
              appearance: "",
              bio: "",
            })
          }
        >
          + Add Character
        </Button>
      </div>
    </div>
  );
}
