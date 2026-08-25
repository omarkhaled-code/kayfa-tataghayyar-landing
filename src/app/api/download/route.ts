import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { verifyDownloadToken } from '@/lib/token';

export const runtime = 'nodejs';

// ==========================================================================
//  تحميل الكتاب (PDF) — محمي بتوكن موقّع (بيتصدر بعد الدفع الناجح أو كوبون صالح).
//  من غير توكن صالح → 403.
//
//  طريقتان لتسليم الملف:
//   1) BOOK_FILE_URL (مُوصى به على Vercel): رابط مباشر للملف (Vercel Blob /
//      Dropbox ?dl=1 / أي CDN). بنعمل redirect ليه بعد التحقق من التوكن —
//      يشتغل لأي حجم (Vercel serverless عنده حد 4.5 ميجا للرد).
//   2) لو BOOK_FILE_URL فاضي: بنبعت الملف المحلي book/book.pdf مباشرة
//      (مناسب محليًا / على VPS؛ مش مناسب على Vercel للملفات > 4.5 ميجا).
// ==========================================================================

const DOWNLOAD_NAME = 'كيف-تتغير-للأفضل.pdf';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!verifyDownloadToken(token)) {
    return NextResponse.json(
      { error: 'رابط التحميل غير صالح أو انتهت صلاحيته.' },
      { status: 403 }
    );
  }

  // (1) رابط خارجي — الأنسب لـ Vercel (أي حجم)
  const fileUrl = process.env.BOOK_FILE_URL;
  if (fileUrl) {
    return NextResponse.redirect(fileUrl, 302);
  }

  // (2) الملف المحلي (محليًا / VPS)
  try {
    const filePath = path.join(process.cwd(), 'book', 'book.pdf');
    const file = await readFile(filePath);

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="book.pdf"; filename*=UTF-8''${encodeURIComponent(
          DOWNLOAD_NAME
        )}`,
        'Content-Length': String(file.length),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e) {
    console.error('Download error:', e);
    return NextResponse.json(
      {
        error:
          'الكتاب غير متاح للتحميل حاليًا. (على Vercel: اضبط BOOK_FILE_URL برابط الملف.)',
      },
      { status: 404 }
    );
  }
}
