import { useTranslations } from 'next-intl';

export default function LogoCloudSection() {
  const t = useTranslations('HomePage.logocloud');

  return (
    <section id="logo-cloud" className="bg-muted/50 px-4 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-xl font-medium">{t('title')}</h2>

        <div className="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
          <img
            className="h-5 w-fit dark:invert"
            src="/svg/nvidia.svg"
            alt="Nvidia Logo"
            height="20"
            width="auto"
          />
          <img
            className="h-4 w-fit dark:invert"
            src="/svg/column.svg"
            alt="Column Logo"
            height="16"
            width="auto"
          />
          <img
            className="h-4 w-fit dark:invert"
            src="/svg/github.svg"
            alt="GitHub Logo"
            height="16"
            width="auto"
          />
          <img
            className="h-5 w-fit dark:invert"
            src="/svg/nike.svg"
            alt="Nike Logo"
            height="20"
            width="auto"
          />
          <img
            className="h-4 w-fit dark:invert"
            src="/svg/laravel.svg"
            alt="Laravel Logo"
            height="16"
            width="auto"
          />
          <img
            className="h-7 w-fit dark:invert"
            src="/svg/lilly.svg"
            alt="Lilly Logo"
            height="28"
            width="auto"
          />
          <img
            className="h-5 w-fit dark:invert"
            src="/svg/lemonsqueezy.svg"
            alt="Lemon Squeezy Logo"
            height="20"
            width="auto"
          />
          <img
            className="h-6 w-fit dark:invert"
            src="/svg/openai.svg"
            alt="OpenAI Logo"
            height="24"
            width="auto"
          />
          <img
            className="h-4 w-fit dark:invert"
            src="/svg/tailwindcss.svg"
            alt="Tailwind CSS Logo"
            height="16"
            width="auto"
          />
          <img
            className="h-5 w-fit dark:invert"
            src="/svg/vercel.svg"
            alt="Vercel Logo"
            height="20"
            width="auto"
          />
          <img
            className="h-5 w-fit dark:invert"
            src="/svg/zapier.svg"
            alt="Zapier Logo"
            height="20"
            width="auto"
          />
        </div>
      </div>
    </section>
  );
}
