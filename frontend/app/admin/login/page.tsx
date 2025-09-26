'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Shield,
  ArrowRight,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useLocaleStore } from '@/lib/locale-store'

export default function AdminLoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [showCredentials, setShowCredentials] = useState(false)
  const [copiedUser, setCopiedUser] = useState<string | null>(null)

  const router = useRouter()
  const { setAuth, isAuthenticated } = useAuthStore()
  const { t } = useLocaleStore()

  // User credentials for all roles
  const userCredentials = [
    {
      role: 'Administrateur',
      email: 'admin@example.com',
      password: 'admin123',
      description: 'Accès complet au système - gestion des produits, utilisateurs, et analytics'
    },
    {
      role: 'Confirmatrice (Centre d\'Appel)',
      email: 'confirmatrice@test.com',
      password: 'confirmatrice123',
      description: 'Confirmation des commandes et service client'
    },
    {
      role: 'Agent de Livraison',
      email: 'agent@test.com',
      password: 'agent123',
      description: 'Coordination des livraisons et suivi des commandes'
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check if already authenticated after mount
    if (mounted && isAuthenticated()) {
      router.push('/admin')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted) return null

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = 'Email requis'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Veuillez entrer un email valide'
    }

    if (!password) {
      newErrors.password = 'Mot de passe requis'
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Use the API client to call the backend
      const data = await api.auth.login(email, password) as {
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          role: string;
        };
        token: string;
      }
      
      // Check if user has admin role
      const adminRoles = ['ADMIN', 'CONFIRMATRICE', 'AGENT_LIVRAISON']
      if (!adminRoles.includes(data.user.role)) {
        toast.error('Accès refusé. Privilèges administrateur requis.')
        setErrors({ 
          email: 'Accès administrateur requis',
          password: 'Accès administrateur requis'
        })
        return
      }
      
      setAuth(data.user, data.token)
      toast.success('Bienvenue ! Connexion réussie.')
      
      // Redirect based on user role
      switch (data.user.role) {
        case 'CONFIRMATRICE':
          router.push('/confirmatrice/dashboard')
          break
        case 'AGENT_LIVRAISON':
          router.push('/agent-livraison/dashboard')
          break
        case 'ADMIN':
        default:
          router.push('/admin/dashboard')
          break
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Échec de la connexion. Veuillez réessayer.')
              setErrors({ 
          email: 'Identifiants invalides',
          password: 'Identifiants invalides'
        })
    } finally {
      setIsLoading(false)
    }
  }

  const fillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail)
    setPassword(userPassword)
    setErrors({}) // Clear any existing errors
    toast.success('Identifiants remplis ! Cliquez sur Se connecter pour continuer.')
  }

  const copyCredentials = async (userEmail: string, userPassword: string) => {
    try {
      await navigator.clipboard.writeText(`Email: ${userEmail}\nPassword: ${userPassword}`)
      setCopiedUser(userEmail)
      toast.success('Identifiants copiés dans le presse-papiers !')
      setTimeout(() => setCopiedUser(null), 2000)
    } catch (err) {
      toast.error('Échec de la copie des identifiants')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} 
        />
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-slate-800/95">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 rounded-t-lg">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-4 shadow-lg"
            >
              <Shield className="w-full h-full text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Connexion Admin
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Accédez à votre tableau de bord
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t?.checkout?.email || 'Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-2 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder="Entrez votre email"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-2 border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-500 hover:text-primary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-2 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="remember" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Se souvenir de moi
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.form>

            {/* Test Credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="border-t border-slate-200 dark:border-slate-600 pt-6"
            >
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4 border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                onClick={() => setShowCredentials(!showCredentials)}
              >
                <Users className="w-4 h-4 mr-2" />
                Identifiants de Test
                {showCredentials ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>

              {showCredentials && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {userCredentials.map((user, index) => (
                    <div
                      key={index}
                      className="p-4 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                          {user.role}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fillCredentials(user.email, user.password)}
                            className="h-7 px-3 text-xs border-primary/30 hover:bg-primary hover:text-white transition-all duration-200"
                          >
                            Remplir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyCredentials(user.email, user.password)}
                            className="h-7 px-3 text-xs border-primary/30 hover:bg-primary hover:text-white transition-all duration-200"
                          >
                            {copiedUser === user.email ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3 text-primary" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">Email:</span>
                          <span className="font-mono text-slate-600 dark:text-slate-400">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Lock className="w-3 h-3 text-primary" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">Mot de passe:</span>
                          <span className="font-mono text-slate-600 dark:text-slate-400">{user.password}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {user.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}