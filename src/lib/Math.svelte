<script lang="ts">
  import katex from 'katex';

  interface Props {
    formula: string;
    display?: boolean;
  }

  let { formula, display = false }: Props = $props();

  let html = $derived(katex.renderToString(formula, { displayMode: display, throwOnError: false }));
</script>

{@html html}
