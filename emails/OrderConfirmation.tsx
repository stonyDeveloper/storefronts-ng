import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { formatMoney } from "@/lib/utils";

export interface OrderConfirmationProps {
  storeName: string;
  storeLogoUrl?: string | null;
  primaryColor: string;
  currency: string;
  reference: string;
  customerName: string;
  items: Array<{
    name: string;
    image?: string | null;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  isCashOnDelivery: boolean;
  trackUrl: string;
  storeUrl: string;
}

const font =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function OrderConfirmation({
  storeName,
  storeLogoUrl,
  primaryColor,
  currency,
  reference,
  customerName,
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryAddress,
  deliveryCity,
  deliveryState,
  isCashOnDelivery,
  trackUrl,
  storeUrl,
}: OrderConfirmationProps) {
  const firstName = customerName.trim().split(/\s+/)[0];

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {isCashOnDelivery
          ? `Your order from ${storeName} is confirmed — pay on delivery.`
          : `Payment received — your order from ${storeName} is confirmed.`}
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
          {/* Brand accent bar */}
          <Section style={{ backgroundColor: primaryColor, height: 6, fontSize: 1, lineHeight: "6px" }}>
            &nbsp;
          </Section>

          <Section style={{ padding: "36px 40px 0" }}>
            {storeLogoUrl ? (
              <Img
                src={storeLogoUrl}
                alt={storeName}
                width={48}
                height={48}
                style={{ borderRadius: 12, objectFit: "cover", marginBottom: 20 }}
              />
            ) : null}
            <Text
              style={{
                color: "#71717a",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                margin: "0 0 8px",
              }}
            >
              {storeName}
            </Text>
            <Heading
              as="h1"
              style={{ color: "#18181b", fontSize: 26, fontWeight: 700, lineHeight: 1.25, margin: "0 0 12px" }}
            >
              Order confirmed{firstName ? `, ${firstName}` : ""} 🎉
            </Heading>
            <Text style={{ color: "#52525b", fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" }}>
              {isCashOnDelivery
                ? "Thanks for your order! You'll pay in cash when it's delivered. The seller will contact you shortly to confirm."
                : "Thanks for your order! Your payment was received and the seller is getting it ready."}
            </Text>

            {/* Reference pill */}
            <Section
              style={{
                backgroundColor: "#fafafa",
                border: "1px solid #e4e4e7",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 28,
              }}
            >
              <Text style={{ color: "#71717a", fontSize: 12, margin: "0 0 2px" }}>Order reference</Text>
              <Text
                style={{
                  color: "#18181b",
                  fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {reference}
              </Text>
            </Section>
          </Section>

          {/* Items */}
          <Section style={{ padding: "0 40px" }}>
            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: 14 }}>
                <Column style={{ width: 56, verticalAlign: "top" }}>
                  {item.image ? (
                    <Img
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      style={{ borderRadius: 10, objectFit: "cover", border: "1px solid #e4e4e7" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        backgroundColor: "#f4f4f5",
                        border: "1px solid #e4e4e7",
                      }}
                    />
                  )}
                </Column>
                <Column style={{ verticalAlign: "top", paddingLeft: 12 }}>
                  <Text style={{ color: "#18181b", fontSize: 14, fontWeight: 600, margin: "2px 0 2px" }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: "#71717a", fontSize: 13, margin: 0 }}>
                    Qty {item.quantity} · {formatMoney(item.unitPrice, currency)}
                  </Text>
                </Column>
                <Column style={{ verticalAlign: "top", textAlign: "right" as const }}>
                  <Text style={{ color: "#18181b", fontSize: 14, fontWeight: 600, margin: "2px 0 0" }}>
                    {formatMoney(item.unitPrice * item.quantity, currency)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={{ borderColor: "#e4e4e7", margin: "16px 0" }} />

            {/* Totals */}
            <Row style={{ marginBottom: 4 }}>
              <Column>
                <Text style={{ color: "#71717a", fontSize: 14, margin: 0 }}>Subtotal</Text>
              </Column>
              <Column style={{ textAlign: "right" as const }}>
                <Text style={{ color: "#18181b", fontSize: 14, margin: 0 }}>
                  {formatMoney(subtotal, currency)}
                </Text>
              </Column>
            </Row>
            <Row style={{ marginBottom: 4 }}>
              <Column>
                <Text style={{ color: "#71717a", fontSize: 14, margin: 0 }}>Delivery</Text>
              </Column>
              <Column style={{ textAlign: "right" as const }}>
                <Text style={{ color: "#18181b", fontSize: 14, margin: 0 }}>
                  {deliveryFee > 0 ? formatMoney(deliveryFee, currency) : "Free"}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={{ color: "#18181b", fontSize: 16, fontWeight: 700, margin: "8px 0 0" }}>
                  Total
                </Text>
              </Column>
              <Column style={{ textAlign: "right" as const }}>
                <Text style={{ color: "#18181b", fontSize: 16, fontWeight: 700, margin: "8px 0 0" }}>
                  {formatMoney(total, currency)}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Delivery + CTA */}
          <Section style={{ padding: "28px 40px 36px" }}>
            <Section
              style={{
                backgroundColor: "#fafafa",
                border: "1px solid #e4e4e7",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 24,
              }}
            >
              <Text style={{ color: "#71717a", fontSize: 12, margin: "0 0 4px" }}>Delivering to</Text>
              <Text style={{ color: "#18181b", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                {deliveryAddress}, {deliveryCity}, {deliveryState}
              </Text>
            </Section>

            <Link
              href={trackUrl}
              style={{
                backgroundColor: primaryColor,
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
              Track your order
            </Link>
            <Text style={{ color: "#a1a1aa", fontSize: 12, textAlign: "center" as const, margin: "12px 0 0" }}>
              Or keep shopping at{" "}
              <Link href={storeUrl} style={{ color: "#52525b", textDecoration: "underline" }}>
                {storeName}
              </Link>
            </Text>
          </Section>
        </Container>

        <Text style={{ color: "#a1a1aa", fontSize: 12, textAlign: "center" as const, margin: "20px 0 0" }}>
          Powered by Storefronts
        </Text>
      </Body>
    </Html>
  );
}

OrderConfirmation.PreviewProps = {
  storeName: "Ada Fashion",
  storeLogoUrl: null,
  primaryColor: "#18181B",
  currency: "NGN",
  reference: "SF-1750765432-A1B2C3",
  customerName: "Chidinma Okafor",
  items: [
    { name: "Ankara Wrap Dress", image: null, quantity: 1, unitPrice: 1500000 },
    { name: "Beaded Clutch", image: null, quantity: 2, unitPrice: 450000 },
  ],
  subtotal: 2400000,
  deliveryFee: 150000,
  total: 2550000,
  deliveryAddress: "12 Adeola Odeku Street",
  deliveryCity: "Victoria Island",
  deliveryState: "Lagos",
  isCashOnDelivery: false,
  trackUrl: "http://localhost:3000/track/SF-1750765432-A1B2C3",
  storeUrl: "http://localhost:3000/store/ada-fashion",
} satisfies OrderConfirmationProps;
