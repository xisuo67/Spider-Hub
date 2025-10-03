'use client';

import { subscribeNewsletterAction } from '@/actions/subscribe-newsletter';
import { FormError } from '@/components/shared/form-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

/**
 * Waitlist form card component
 * This is a client component that handles the waitlist form submission
 */
export function WaitlistFormCard() {
  const t = useTranslations('WaitlistPage.form');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>('');

  // Create a schema for waitlist form validation
  const formSchema = z.object({
    email: z.email({ message: t('emailValidation') }),
  });

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        setError('');

        const result = await subscribeNewsletterAction({
          email: values.email,
        });

        if (result?.data?.success) {
          toast.success(t('success'));
          form.reset();
        } else {
          const errorMessage = result?.data?.error || t('fail');
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        console.error('Form submission error:', err);
        setError(t('fail'));
        toast.error(t('fail'));
      }
    });
  };

  return (
    <Card className="mx-auto max-w-lg overflow-hidden pt-6 pb-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('email')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormError message={error} />
          </CardContent>
          <CardFooter className="mt-6 px-6 py-4 flex justify-between items-center bg-muted rounded-none">
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? t('subscribing') : t('subscribe')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
