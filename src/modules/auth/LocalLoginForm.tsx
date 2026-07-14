import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
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
      <label className="form-field">
        <span className="form-label">{t('auth.email')}</span>
        <Input autoComplete="username" {...register('email')} />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </label>
      <label className="form-field">
        <span className="form-label">{t('auth.password')}</span>
        <Input autoComplete="current-password" type="password" {...register('password')} />
        {errors.password && <span className="form-error">{errors.password.message}</span>}
      </label>
      <Button className="login-submit" disabled={pending} type="submit" variant="primary">
        {t('auth.localLogin')}
      </Button>
    </form>
  )
}
