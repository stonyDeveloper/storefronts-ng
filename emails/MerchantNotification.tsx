import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { formatMoney } from "@/lib/utils";

export interface MerchantNotificationProps {
  storeName: string;
  currency: string;
  reference: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  isCashOnDelivery: boolean;
  notes?: string | null;
  waMeUrl: string | null;
  orderUrl: string;
}

const font =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const labelStyle = { color: "#71717a", fontSize: 12, margin: "0 0 2px" };
const valueStyle = { color: "#18181b", fontSize: 14, lineHeight: 1.5, margin: "0 0 12px" };

export default function MerchantNotification({
  storeName,
  currency,
  reference,
  items,
  subtotal,
  deliveryFee,
  total,
  customerName,
  customerEmail,
  customerPhone,
  deliveryAddress,
  deliveryCity,
  deliveryState,
  isCashOnDelivery,
  notes,
  waMeUrl,
  orderUrl,
}: MerchantNotificationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {`${customerName} placed a ${formatMoney(total, currency)} order (${
          isCashOnDelivery ? "cash on delivery" : "paid"
        }) at ${storeName}.`}
      </Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: font, margin: 0, padding: "24px 12px" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            maxWidth: 560,
            overflow: "hidden",
            border: "1px solid #e4e4e7",
          }}
        >
          {/* Dark header — this is a money moment */}
          <Section style={{ backgroundColor: "#18181b", padding: "32px 40px" }}>
            <Text
              style={{
                color: "#a1a1aa",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                margin: "0 0 8px",
              }}
            >
              {storeName} · New order
            </Text>
            <Heading
              as="h1"
              style={{ color: "#ffffff", fontSize: 28, fontWeight: 700, lineHeight: 1.2, margin: "0 0 6px" }}
            >
              {formatMoney(total, currency)}
            </Heading>
            <Text style={{ color: "#a1a1aa", fontSize: 13, margin: 0 }}>
              {reference} ·{" "}
              {isCashOnDelivery ? (
                <span style={{ color: "#fbbf24", fontWeight: 600 }}>Cash on delivery — unpaid</span>
              ) : (
                <span style={{ color: "#34d399", fontWeight: 600 }}>Paid via Paystack</span>
              )}
            </Text>
          </Section>

          {isCashOnDelivery ? (
            <Section style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "14px 40px" }}>
              <Text style={{ color: "#92400e", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                <strong>Action needed:</strong> this buyer chose cash on delivery. Call or WhatsApp them
                to confirm the order before you dispatch.
              </Text>
            </Section>
          ) : null}

          {/* Buyer */}
          <Section style={{ padding: "28px 40px 0" }}>
            <Text
              style={{
                color: "#71717a",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                margin: "0 0 12px",
              }}
            >
              Buyer
            </Text>
            <Text style={labelStyle}>Name</Text>
            <Text style={valueStyle}>{customerName}</Text>
            <Text style={labelStyle}>Phone</Text>
            <Text style={valueStyle}>{customerPhone}</Text>
            <Text style={labelStyle}>Email</Text>
            <Text style={valueStyle}>{customerEmail}</Text>
            <Text style={labelStyle}>Delivery address</Text>
            <Text style={valueStyle}>
              {deliveryAddress}, {deliveryCity}, {deliveryState}
            </Text>
            {notes ? (
              <>
                <Text style={labelStyle}>Buyer notes</Text>
                <Text style={{ ...valueStyle, fontStyle: "italic" }}>&ldquo;{notes}&rdquo;</Text>
              </>
            ) : null}
          </Section>

          {/* Items */}
          <Section style={{ padding: "8px 40px 0" }}>
            <Hr style={{ borderColor: "#e4e4e7", margin: "0 0 16px" }} />
            <Text
              style={{
                color: "#71717a",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                margin: "0 0 12px",
              }}
            >
              Items
            </Text>
            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: 8 }}>
                <Column>
                  <Text style={{ color: "#18181b", fontSize: 14, margin: 0 }}>
                    {item.name}{" "}
                    <span style={{ color: "#71717a" }}>× {item.quantity}</span>
                  </Text>
                </Column>
                <Column style={{ textAlign: "right" as const }}>
                  <Text style={{ color: "#18181b", fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {formatMoney(item.unitPrice * item.quantity, currency)}
                  </Text>
                </Column>
              </Row>
            ))}
            <Hr style={{ borderColor: "#e4e4e7", margin: "12px 0" }} />
            <Row style={{ marginBottom: 2 }}>
              <Column>
                <Text style={{ color: "#71717a", fontSize: 13, margin: 0 }}>Subtotal</Text>
              </Column>
              <Column style={{ textAlign: "right" as const }}>
                <Text style={{ color: "#18181b", fontSize: 13, margin: 0 }}>
                  {formatMoney(subtotal, currency)}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={{ color: "#71717a", fontSize: 13, margin: 0 }}>Delivery</Text>
              </Column>
              <Column style={{ textAlign: "right" as const }}>
                <Text style={{ color: "#18181b", fontSize: 13, margin: 0 }}>
                  {deliveryFee > 0 ? formatMoney(deliveryFee, currency) : "Free"}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Actions */}
          <Section style={{ padding: "24px 40px 36px" }}>
            {waMeUrl ? (
              <Link
                href={waMeUrl}
                style={{
                  backgroundColor: "#25D366",
                  borderRadius: 12,
                  color: "#ffffff",
                  display: "block",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "13px 24px",
                  textAlign: "center" as const,
                  textDecoration: "none",
                  marginBottom: 12,
                }}
              >
                Chat buyer on WhatsApp
              </Link>
            ) : null}
            <Link
              href={orderUrl}
              style={{
                backgroundColor: "#18181b",
                borderRadius: 12,
                color: "#ffffff",
                display: "block",
                fontSize: 15,
                fontWeight: 600,
                padding: "13px 24px",
                textAlign: "center" as const,
                textDecoration: "none",
              }}
            >
              View order in dashboard
            </Link>
          </Section>
        </Container>

        <Text style={{ color: "#a1a1aa", fontSize: 12, textAlign: "center" as const, margin: "20px 0 0" }}>
          Powered by Storefronts
        </Text>
      </Body>
    </Html>
  );
}

MerchantNotification.PreviewProps = {
  storeName: "Ada Fashion",
  currency: "NGN",
  reference: "SF-1750765432-A1B2C3",
  items: [
    { name: "Ankara Wrap Dress", quantity: 1, unitPrice: 1500000 },
    { name: "Beaded Clutch", quantity: 2, unitPrice: 450000 },
  ],
  subtotal: 2400000,
  deliveryFee: 150000,
  total: 2550000,
  customerName: "Chidinma Okafor",
  customerEmail: "chidinma@example.com",
  customerPhone: "0803 123 4567",
  deliveryAddress: "12 Adeola Odeku Street",
  deliveryCity: "Victoria Island",
  deliveryState: "Lagos",
  isCashOnDelivery: true,
  notes: "Please call before delivery.",
  waMeUrl: "https://wa.me/2348031234567",
  orderUrl: "http://localhost:3000/orders/abc123",
} satisfies MerchantNotificationProps;
