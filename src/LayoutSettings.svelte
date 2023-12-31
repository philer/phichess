<script lang="ts">
  import { match } from "ts-pattern"

  import LayoutSettingsOption from "./LayoutSettingsOption.svelte"
  import { type LayoutPerspective } from "./settings"
  import { settings } from "./stores"

  type LayoutName =
    | "single"
    | "singleOpposite"
    | "side-by-side"
    | "opposite"
    | "custom"

  const single = [{
    asWhite: true,
    rotate: 0,
    flipOpponentPieces: false,
  }] as const

  const singleOpposite = [{
    asWhite: true,
    rotate: 0,
    flipOpponentPieces: true,
  }] as const

  const sideBySide = [
    { asWhite: false, rotate: 0, flipOpponentPieces: false },
    { asWhite: true, rotate: 0, flipOpponentPieces: false },
  ] as const

  const opposite = [
    { asWhite: false, rotate: 180, flipOpponentPieces: false },
    { asWhite: true, rotate: 0, flipOpponentPieces: false },
  ] as const


  let layoutName: LayoutName = match($settings.layout)
      .with(single, () => "single" as const)
      .with(singleOpposite, () => "singleOpposite" as const)
      .with(sideBySide, () => "side-by-side" as const)
      .with(opposite, () => "opposite" as const)
      .otherwise(() => "custom" as const)

  const custom = layoutName === "custom" && $settings.layout

  $: {
    settings.update($settings => ({
      ...$settings,
      layout: match(layoutName)
        .with("single", () => single as unknown as LayoutPerspective[])
        .with("singleOpposite", () => singleOpposite as unknown as LayoutPerspective[])
        .with("side-by-side", () => sideBySide as unknown as LayoutPerspective[])
        .with("opposite", () => opposite as unknown as LayoutPerspective[])
        .with("custom", () => custom as unknown as LayoutPerspective[])
        .exhaustive(),
    }))
  }

  let landscape: boolean = window.innerWidth > window.innerHeight
  const handleResize = () => {
    landscape = window.innerWidth > window.innerHeight
  }
</script>


<svelte:window on:resize={handleResize} />

<div class={`layout-list ${landscape ? "landscape" : "portrait"}`}>
  <LayoutSettingsOption
    label="Single"
    value="single"
    layout={single}
    bind:group={layoutName}
    {landscape}
  />

  <LayoutSettingsOption
    label="Single opposite"
    value="singleOpposite"
    layout={singleOpposite}
    bind:group={layoutName}
    {landscape}
  />

  <LayoutSettingsOption
    label="Side by side"
    value="side-by-side"
    layout={sideBySide}
    bind:group={layoutName}
    {landscape}
  />

  <LayoutSettingsOption
    label="Opposite"
    value="opposite"
    layout={opposite}
    bind:group={layoutName}
    {landscape}
  />

  {#if custom}
    <LayoutSettingsOption
      label="Custom"
      value="custom"
      layout={custom}
      bind:group={layoutName}
      {landscape}
    />
  {/if}

</div>


<style lang="sass">
  .layout-list
    display: flex
    justify-content: center
    flex-wrap: wrap
    gap: 2em 2em
</style>
