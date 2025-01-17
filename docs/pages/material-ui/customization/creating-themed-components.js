import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/material/customization/creating-themed-components/creating-themed-components.md?@mui/markdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
