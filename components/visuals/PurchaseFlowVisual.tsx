import type { VisualCopy } from "@/lib/copy";
import { DASHBOARD_URL } from "@/lib/site";
import { Bar, BrowserFrame, Cursor, Photo } from "./parts";

const DASHBOARD_HOST = new URL(DASHBOARD_URL).host;

/**
 * The purchase button's path, drawn like the dashboard's "Add to your website"
 * story: the seller's own button, the product page Square Share hosts, then
 * checkout.
 */
export function PurchaseFlowVisual({ copy }: { copy: VisualCopy }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 items-start gap-2 sm:gap-4">
        <BrowserFrame url={copy.domain}>
          <div className="relative flex flex-col gap-1.5 p-2.5">
            <Photo product="camera" className="aspect-square w-full rounded-sm" />
            <Bar className="w-4/5" />
            <Bar className="w-3/5" />
            <span className="mt-1 self-start rounded-full bg-fd-foreground px-2 py-1 font-inter text-[9px] font-semibold text-fd-background">
              {copy.buyNow}
            </span>
            <Cursor label={copy.customer} className="bottom-0 left-[55%]" />
          </div>
        </BrowserFrame>
        <BrowserFrame url={DASHBOARD_HOST} brand>
          <div className="flex flex-col gap-1.5 p-2.5">
            <Photo product="camera" className="aspect-square w-full" />
            <span className="truncate font-display text-[10px] font-bold text-fd-foreground">{copy.product}</span>
            <Bar className="w-2/5" />
            <span className="mt-1 block bg-fd-foreground py-1 text-center font-inter text-[9px] font-semibold text-fd-background">
              {copy.buyNow}
            </span>
          </div>
        </BrowserFrame>
        <BrowserFrame url={DASHBOARD_HOST} brand>
          <div className="flex flex-col gap-1.5 p-2.5">
            <span className="font-display text-[10px] font-bold text-fd-foreground">{copy.checkout}</span>
            <Bar className="h-4 w-full border border-fd-border bg-fd-background" />
            <Bar className="h-4 w-full border border-fd-border bg-fd-background" />
            <Bar className="h-4 w-full border border-fd-border bg-fd-background" />
            <span className="mt-1 block bg-acid py-1 text-center font-inter text-[9px] font-semibold text-white">
              {copy.pay}
            </span>
          </div>
        </BrowserFrame>
      </div>
      <ol className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-widest text-fd-muted-foreground sm:gap-4">
        {[copy.yourSite, copy.productPage, copy.checkout].map((label, index) => (
          <li key={label} className="flex items-start gap-1.5 leading-tight">
            <span className="text-fd-foreground">0{index + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
