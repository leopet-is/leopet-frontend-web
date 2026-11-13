import React, { useState, useRef, useEffect } from "react";
import { X, Mail, Lock, User, Heart, IdCard, Eye, EyeOff, Phone } from "lucide-react";
import { useAuth, type AuthUser } from "../context/AuthContext";
import isEmail from "validator/lib/isEmail";
import { esCedulaValida, esTelefonoEcuador } from '../lib/validators';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth();
  
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === "login") {
      if (!email.trim()) {
        newErrors.email = "Es necesario email";
      } else if (!isEmail(email.trim())) {
        newErrors.email = "El email debe ser un correo electronico valido";
      }
      if (!password) {
        newErrors.password = "Es necesario contrasena";
      }
    }  
    else {
      if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
      if (!apellido.trim()) newErrors.apellido = "El apellido es obligatorio";
      if (!cedula.trim()) newErrors.cedula = "El campo cedula es obligatorio";
      else if (!esCedulaValida(cedula)) newErrors.cedula = "La cedula no es una cedula ecuatoriana valida";
      if (!telefono.trim()) newErrors.telefono = "El campo telefono es obligatorio";
      else if (!esTelefonoEcuador(telefono)) newErrors.telefono = "El telefono no es un numero ecuatoriano valido";
      if (!email.trim()) newErrors.email = "El correo es obligatorio";
      else if (!isEmail(email.trim())) newErrors.email = "Ingresa un correo válido";
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&._-])[A-Za-z\d@$!%*#?&._-]+$/;
      if (!password) newErrors.password = "El campo password es obligatorio";
      else if (password.length < 8) newErrors.password = "La contrasena debe tener al menos 8 caracteres";
      else if (!passwordRegex.test(password)) newErrors.password = "La contrasena debe incluir minusculas, mayusculas, un numero y un caracter especial";
      if (!confirmPassword) newErrors.confirmPassword = "Confirma tu contraseña";
      else if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); 

    if (!validateFields()){
      console.log("Errores de validación:", errors);
        return;
    } 

    setIsSubmitting(true);

    try {
      let authenticatedUser: AuthUser;
      if (mode === "login") {
        authenticatedUser = await login(email, password);
      } else {
        authenticatedUser = await register(
          nombre,
          apellido,
          email,
          password,
          telefono,
          cedula
        );
      }

      onSuccess?.(authenticatedUser);
      onClose();
      resetForm();
    } catch (error: unknown) {
      setErrors({ form: (error as Error).message || "Ocurrió un error al conectar con el servidor" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNombre("");
    setApellido("");
    setCedula("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setErrors({});
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
    resetForm();
  };


  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#07c4e1]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart size={24} className="text-[#00626d]" />
          </div>
          <div>
            <h2 className="text-[#004955] text-2xl font-semibold">
              {mode === "login" ? "Bienvenido de vuelta" : "Únete a Leopet"}
            </h2>
            <p className="text-[#3e494a] text-sm">
              {mode === "login" ? "Inicia sesión para continuar" : "Crea tu cuenta de padrino"}
            </p>
          </div>
        </div>

        

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === "register" && (
            <>
              <div>
                <label htmlFor="auth-nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-[#ee5871]" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={firstInputRef}
                    id="auth-nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="María Fernanda"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] focus:border-transparent outline-none transition-colors ${
                      errors.nombre ? "border-red-400 bg-red-50" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label htmlFor="auth-apellido" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span className="text-[#ee5871]" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="auth-apellido"
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Gómez López"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none transition-colors ${
                      errors.apellido ? "border-red-400 bg-red-50" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
              </div>
              
              <div>
                <label htmlFor="auth-cedula" className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula <span className="text-[#ee5871]" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <IdCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="auth-cedula"
                    type="text"
                    inputMode="numeric"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="1712345678"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none transition-colors ${
                      errors.cedula ? "border-red-400 bg-red-50" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
              </div>
              
              <div>
                <label htmlFor="auth-telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-[#ee5871]" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="auth-telefono"
                    type="text"
                    inputMode="numeric"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="0912345678"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none transition-colors ${
                      errors.telefono ? "border-red-400 bg-red-50" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico <span className="text-[#ee5871]" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={mode === "login" ? firstInputRef : undefined}
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none transition-colors ${
                  errors.email ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-[#ee5871]" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none transition-colors ${
                  errors.password ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="auth-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña <span className="text-[#ee5871]" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="auth-confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none transition-colors ${
                    errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

        {errors.form && (
          <div className=" text-red-600 text-sm flex items-center gap-2 justify-center">
            {errors.form}
          </div>
        )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#00626d] hover:bg-[#004955] text-[#07c4e1] font-medium text-lg py-3.5 rounded-full transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2 mt-6"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{mode === "login" ? "Ingresando..." : "Creando cuenta..."}</span>
              </>
            ) : (
              mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            onClick={switchMode}
            className="text-[#07c4e1] font-semibold hover:underline"
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}