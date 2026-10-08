import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const cartDetails = await req.json();

  // validate the priceId
  const structuredData = {
    line_items: Object.values(cartDetails).map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    })),
  };

  const allQuantity = structuredData.line_items
    .map((item: any) => item.quantity)
    .reduce((a: any, b: any) => a + b, 0);

  const allNames = structuredData.line_items
    .map((item: any) => item.price_data.product_data.name)
    .join(' & ');

  if (!structuredData.line_items) {
    return NextResponse.json({ success: false });
  }
  const origin = req.headers.get('origin');

  try {
    const session = await stripe.checkout.sessions.create({
      submit_type: 'pay',
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: structuredData.line_items,
      currency: 'usd',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      shipping_options: [
        {
          shipping_rate: 'shr_1OEXL0LtGdPVhGLeUX3qlYJB',
        },
      ],
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      metadata: {
        quantity: allQuantity,
        names: allNames,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.log('error', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
