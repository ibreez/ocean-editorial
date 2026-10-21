import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ޞަފްޙާ ފެންނާކަށް ނެތް (404) | Ocean Editorial",
  description: "ތިޔަ އެދިވަޑައިގެންނެވި ޞަފްޙާ ވަނީ ބަދަލުކުރެވިފައި ނުވަތަ ޑިލީޓްކުރެވިފައެވެ.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="bg-[#FFFFFF] border border-[#DCE4DF] rounded-[10px] p-8 sm:p-12 max-w-lg mx-auto shadow-xs">
        <span className="text-4xl font-black text-[#D94343] block mb-2 font-latin">
          404
        </span>
        <h2 className="text-2xl font-bold text-[#182624] mb-3">
          ޞަފްޙާ ފެންނާކަށް ނެތް
        </h2>
        <p className="text-sm text-[#53635F] leading-relaxed mb-6">
          ތިޔަ އެދިވަޑައިގެންނެވި ޞަފްޙާ ވަނީ ބަދަލުކުރެވިފައި ނުވަތަ ޑިލީޓްކުރެވިފައެވެ.
        </p>
        <Link href="/">
          <Button variant="primary" size="md">
            ފުރަތަމަ ޞަފްޙާއަށް އެނބުރި ވަޑައިގަންނަވާ
          </Button>
        </Link>
      </div>
    </div>
  );
}
