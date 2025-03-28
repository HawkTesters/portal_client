"use client";

import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { useCertificationTableFilters } from "./use-certifications-table-filters";

export default function CertificationTableAction() {
  const {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
  } = useCertificationTableFilters();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey="href"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
