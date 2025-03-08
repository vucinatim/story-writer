"use client";

import NovelConfigAssistant from "@/components/common/novel-config-assistant";
import NovelForm from "@/components/common/novel-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Novel } from "@/lib/schemas";

interface NovelConfiguratorProps {
  novel: Novel;
}

const NovelConfigurator = ({ novel }: NovelConfiguratorProps) => {
  return (
    <Tabs
      defaultValue={novel.status === "valid" ? "form" : "chat"}
      className="flex flex-col h-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chat">AI Assistant</TabsTrigger>
        <TabsTrigger value="form">Manual Form</TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="flex-1 relative">
        <NovelConfigAssistant novel={novel} />
      </TabsContent>

      <TabsContent value="form">
        <NovelForm novel={novel} />
      </TabsContent>
    </Tabs>
  );
};

export default NovelConfigurator;
