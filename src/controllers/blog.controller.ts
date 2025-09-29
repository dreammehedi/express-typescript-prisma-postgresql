import type { Request, Response } from "express";
import slugify from "slugify";
import { prisma } from "../../lib/prisma.ts";

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = req.pagination!;

    const [blogs, total] = await prisma.$transaction([
      prisma.blog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.blog.count(),
    ]);

    return res.json({
      success: true,
      message: "All blogs fetched successfully",
      data: blogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const blogs = async (_: Request, res: Response) => {
  try {
    const data = await prisma.blog.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
    return res.json({
      success: true,
      message: "All blogs get successfull",
      data,
    });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
};

export const storeBlog = async (req: Request, res: Response) => {
  try {
    const { name, description, category, image } = req.body;
    const slug = slugify(name || "", {
      lower: true,
      strict: true,
      locale: "en",
      trim: true,
    }) as string; // ensure it's always string

    const existingData = await prisma.blog.findUnique({ where: { slug } });

    if (existingData) {
      return res.json({ success: false, message: "Already store this blog" });
    }
    const newData = await prisma.blog.create({
      data: { name, slug, description, category, image },
    });

    res.json({
      success: true,
      message: "Blog created successfully.",
      data: newData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id, name, description, image, category, status } = req.body;
    if (!id) {
      return res.json({ success: false, message: "Id is required!" });
    }

    const existingData = await prisma.blog.findUnique({ where: { id } });

    if (!existingData) {
      return res.json({ success: false, message: "ExistingData not found!" });
    }
    const updatedSlug = slugify(name, {
      lower: true,
      strict: true,
      locale: "en",
      trim: true,
    }) as string;
    const updatedData = {
      name,
      slug: updatedSlug,
      description,
      image,
      category,
      status,
    };
    const data = await prisma.blog.update({ where: { id }, data: updatedData });

    return res.json({ success: true, message: "Data update success.", data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const blogDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ success: false, message: "Id is required" });
    }

    const existingData = await prisma.blog.findFirst({
      where: {
        status: "active",
        OR: [{ id }, { slug: id }],
      },
    });
    if (!existingData) {
      return res.json({ success: false, message: "existingData not found" });
    }
    return res.json({
      success: true,
      message: "single data get",
      data: existingData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ success: false, message: "Id is required" });
    }

    const existingData = await prisma.blog.findFirst({
      where: { id },
    });
    if (!existingData) {
      return res.json({ success: false, message: "existingData not found" });
    }
    await prisma.blog.delete({
      where: {
        id,
      },
    });
    return res.json({
      success: true,
      message: "Data delete success.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
