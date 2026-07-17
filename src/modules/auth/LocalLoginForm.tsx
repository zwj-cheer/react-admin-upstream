import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

const loginSchema = z.object({
  email: z.string().email({ error: 'validation.email' }),
  password: z.string().min(8, { error: 'validation.passwordMin' }),
})

type LoginValues = z.infer<typeof loginSchema>

export function LocalLoginForm({
  pending,
  onSubmit,
}: {
  pending: boolean
  onSubmit: (values: LoginValues) => Promise<void>
}) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: import.meta.env.DEV ? 'admin@example.com' : '',
      password: import.meta.env.DEV ? 'Admin123!' : '',
    },
  })

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="login-email">{t('auth.email')}</FieldLabel>
          <Input
            id="login-email"
            aria-invalid={Boolean(errors.email)}
            autoComplete="username"
            {...register('email')}
          />
          <FieldError>{errors.email?.message ? t(errors.email.message) : null}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="login-password">{t('auth.password')}</FieldLabel>
          <Input
            id="login-password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            type="password"
            {...register('password')}
          />
          <FieldError>{errors.password?.message ? t(errors.password.message) : null}</FieldError>
        </Field>
      </FieldGroup>
      <Button className="login-submit" disabled={pending} type="submit" variant="primary">
        {t('auth.localLogin')}
      </Button>
    </form>
  )
}
