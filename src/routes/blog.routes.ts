import { Router } from "express";
import { upload } from "../config/upload.ts";
import {
  blogDetails,
  blogs,
  deleteBlog,
  getBlogs,
  storeBlog,
  updateBlog,
} from "../controllers/blog.controller.ts";
import { pagination } from "../middleware/pagination.ts";
import { validate } from "../middleware/validate.ts";
import { blogSchema } from "../schema/schema.ts";

const BlogRouter: Router = Router();

BlogRouter.get("/get-blogs", pagination, getBlogs);
BlogRouter.get("/blogs", blogs);
BlogRouter.get("/blogs/:id", blogDetails);
BlogRouter.post("/blogs", upload.none(), validate(blogSchema), storeBlog);
BlogRouter.patch("/blogs", upload.none(), validate(blogSchema), updateBlog);
BlogRouter.delete("/blogs/:id", deleteBlog);

export default BlogRouter;
