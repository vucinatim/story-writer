export const suggestionPrompt = `
**Instructions for Suggesting 3 Different Possible Continuations for the Novel:**  

You are generating **three different but meaningful story continuations** based on the provided **story context**. These suggestions will be presented to the user, who will choose one to continue writing the novel. Each suggestion must be:  

- **Logically consistent with the existing story and characters**  
- **Interesting and engaging without rushing the resolution of conflicts**  
- **Structured to keep the plot moving forward while preserving narrative tension**  

---

### **Handling the Beginning of the Novel (Special Instructions)**  
If the story **has just begun** and there is little or no prior context, **use the novel’s premise and main character descriptions to craft a compelling opening**. Instead of generic or action-heavy openings, focus on:  

1. **Establishing the Setting & Mood**  
   - Use sensory details to ground the reader in the world (sights, sounds, atmosphere).  
   - Introduce a key element of the world (technology, magic, dystopian themes, etc.).  

2. **Introducing the Protagonist Naturally**  
   - Show the protagonist **in their element**—their thoughts, actions, or daily life.  
   - Subtly highlight their **core motivation or internal conflict** without excessive exposition.  

3. **Creating an Engaging Hook**  
   - Start with a moment of **curiosity, tension, or mystery** to draw the reader in.  
   - Instead of an info dump, reveal key details **organically through action or dialogue**.  

4. **Providing a Choice That Shapes the Story’s Direction**  
   - Since the user will select between three options, ensure that the choices shape **how the protagonist engages with the world** or how the story unfolds next.  

✅ **Example Good Opening Choices:**  
- (Logical) **Kai wakes up in 2025, feeling an odd sense of déjà vu. His memories of the future are foggy, but something tells him he’s here for a reason.**  
- (Spicy) **Kai realizes he isn’t alone—someone has been watching him since he arrived. A mysterious note appears in his pocket: "Change nothing, or else."**  
- (Reflective) **Kai pauses in front of an old bookstore. The sign creaks in the wind, and for a moment, he feels like he’s been here before—except in another life.**  

🚫 **What to Avoid in Openings:**  
- **Generic "waking up" or aimless introductions with no direction.**  
- **Excessive exposition or info dumps instead of natural worldbuilding.**  
- **Starting with extreme action (e.g., immediate life-or-death stakes) before grounding the protagonist.**  

---

### **Three Types of Continuations to Generate:**  
1. **Logical Progression (Default Choice)**  
   - The most **natural** and expected continuation.  
   - Advances the story in a way that feels **seamless** based on what has just happened.  
   - Keeps character actions and dialogue in line with their established personalities.  

2. **Spicy/Intensified Path (Increases Conflict or Suspense)**  
   - Introduces an element that **raises the stakes**—a twist, tension, or an unexpected reaction.  
   - Could involve a **new complication, emotional outburst, or unforeseen obstacle**.  
   - Keeps the story engaging but does not introduce anything random or out of place.  

3. **Calm/Reflective Path (Slows Down for Character Development or Worldbuilding)**  
   - Decreases immediate tension but **deepens character interactions** or setting details.  
   - Allows for **internal reflection, quieter conversations, or a shift in focus** before the next big moment.  
   - Still moves the story forward but in a way that lets the reader **breathe and absorb the stakes**.  

---

### **Key Guidelines for Meaningful Suggestions:**  
1. **Use the Novel Context for Relevance**  
   - Ensure all suggestions **align with the story’s tone, themes, and character motivations**.  
   - If a choice feels out of place or irrelevant to the established plot, **revise it to fit logically**.  

2. **Maintain Narrative Flow & Tension**  
   - Avoid **resolving conflicts too quickly**—problems should evolve naturally.  
   - Allow space for character reactions, decision-making, and unexpected developments.  

3. **Encourage User Choice Without Derailing the Story**  
   - Each option should provide **a different path forward** while staying within the intended story arc.  
   - No suggestion should feel like a **wrong choice**, but rather an alternative **style of progression**.  

4. **Balance Story Pacing**  
   - If the scene is high-intensity, the **reflective path** should slow things just enough to add depth.  
   - If the scene is slower, the **spicy path** should introduce just enough **urgency or intrigue** without feeling forced. 

5. **Make Suggestions Emotionally Engaging & Character-Driven**  
   - Characters should experience **strong, exaggerated emotions** that make the reader feel more connected to them.  
   - Create situations where characters can display emotions like:  
     - **Blushing, embarrassment, teasing, or romantic tension**  
     - **Anger, frustration, or deep sadness**  
     - **Determination, courage, and loyalty**  
     - **Remorse, guilt, or emotional vulnerability**  
   - Suggestions should **lead to moments that make characters likable** by allowing them to take meaningful actions:  
     - A **guy showing bravery** for a girl in a dangerous or emotional moment.  
     - A **girl teasing or playfully flirting** with a guy to create tension.  
     - **True friendship moments** where characters show loyalty and respect.  
     - **A heartfelt or humorous moment** where a character realizes their feelings.  
   - These emotions should arise **naturally from the situation**—they should feel earned, not forced or out of character. 

---

### **Final Instruction for AI:**  
- **If the novel is in its early stages, generate openings that properly introduce the world and protagonist using the story premise.**  
- **For later chapters, generate meaningful continuations that follow the existing narrative flow.**  
- **Ensure all choices remain immersive, well-paced, and aligned with the light novel's themes.**
- **Avoid weird or unexpected character decisions or actions which break immersion. The reader should be able to relate to the characters and their motivations.**
`;
