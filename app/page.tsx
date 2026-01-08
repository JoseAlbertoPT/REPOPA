"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockUsers } from "@/lib/data"
import { Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (user) {
      sessionStorage.setItem("currentUser", JSON.stringify(user))
      router.push("/dashboard")
    } else {
      setError("Correo electrónico o contraseña incorrectos")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2E3B2B] via-[#71785b] to-[#7C4A36] p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">REPOPA</CardTitle>
            <CardDescription className="text-base mt-2">
              Registro Público de Organismos Públicos Auxiliares
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-2">Procuraduría Fiscal - Gobierno del Estado de Morelos</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@morelos.gob.mx"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Usuarios de prueba:</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>
                <strong>Administrador:</strong> admin@morelos.gob.mx / admin123
              </p>
              <p>
                <strong>Editor:</strong> editor@morelos.gob.mx / editor123
              </p>
              <p>
                <strong>Lector:</strong> lector@morelos.gob.mx / lector123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
