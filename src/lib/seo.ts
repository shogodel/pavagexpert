export function alternatesWithDefault(path: string) {
  return {
    languages: {
      "x-default": `/fr${path}`,
      fr: `/fr${path}`,
      en: `/en${path}`,
    },
  };
}
