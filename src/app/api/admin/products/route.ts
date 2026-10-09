import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/server/admin-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const data = await getProducts({ page, limit, search, category });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      discountPrice,
      stock,
      images,
      image,
      categoryName,
      category,
      subcategory,
    } = body;

    const targetCategory = categoryName || category;

    if (!title || price === undefined || !targetCategory) {
      return NextResponse.json(
        { success: false, error: "Title, price, and category are required." },
        { status: 400 }
      );
    }

    if (
      Number(price) < 0 ||
      (discountPrice && Number(discountPrice) < 0) ||
      (stock && Number(stock) < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Price, discount price, and stock cannot be negative values.",
        },
        { status: 400 }
      );
    }

    const product = await createProduct({
      title,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock) || 0,
      images,
      image,
      categoryName: targetCategory,
      subcategory,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      title,
      description,
      price,
      discountPrice,
      stock,
      images,
      image,
      categoryName,
      category,
      subcategory,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    if (
      (price !== undefined && Number(price) < 0) ||
      (discountPrice !== undefined &&
        discountPrice !== null &&
        Number(discountPrice) < 0) ||
      (stock !== undefined && Number(stock) < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Price, discount price, and stock cannot be negative values.",
        },
        { status: 400 }
      );
    }

    const updated = await updateProduct(productId, {
      title,
      description,
      price: price !== undefined ? Number(price) : undefined,
      discountPrice: discountPrice !== undefined ? discountPrice : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      images,
      image,
      categoryName: categoryName || category,
      subcategory,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const deleted = await deleteProduct(productId);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
