// Permite importações de CSS como side-effects (ex: import "@/styles/globals.css")
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
