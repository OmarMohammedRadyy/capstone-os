"use client";

import React, { useState } from "react";
import { MobileNav } from "@/components/navigation/mobile-nav";

export function MobileNavWrapper({ projectSlug }: { projectSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileNav
      projectSlug={projectSlug}
      isOpen={isOpen}
      onClose={() => setIsOpen(!isOpen)}
    />
  );
}

