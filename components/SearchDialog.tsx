"use client";

import {
  SearchDialog as FumadocsSearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useStaticSearch } from "fumadocs-core/search/client";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { SEARCH_INDEX_PATH } from "@/lib/urls";

/** Static search: the browser downloads the prebuilt index, no search service. */
export default function SearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const search = useStaticSearch({ from: SEARCH_INDEX_PATH, locale });

  return (
    <FumadocsSearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
    </FumadocsSearchDialog>
  );
}
