import z from "zod";

export const blogSchema = z.object({
  name: z.string().min(1),
  description: z.string("Description is required"),
  category: z.string().min(1),
  image: z.string().min(10),
  status: z.enum(["active", "inactive"]),
});
