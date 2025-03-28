"use client";

import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useClientTableFilters } from "./use-client-table-filters";

export default function ClientTableAction() {
  const {
    searchQuery,
    setSearchQuery,
    setPage,
    resetFilters,
    isAnyFilterActive,
  } = useClientTableFilters();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey="name"
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
