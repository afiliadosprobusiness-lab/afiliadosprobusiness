"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { 
  Users, 
  ShieldAlert, 
  UserMinus, 
  UserCheck, 
  UserX, 
  Search,
  LogOut,
  RefreshCw,
  MoreVertical,
  Trash2
} from "lucide-react";

interface UserData {
  uid: string;
  email: string;
  name: string;
  lastLogin: number;
  createdAt?: number;
  status?: 'active' | 'suspended' | 'disabled';
  photoURL?: string;
  role?: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  const loadData = async () => {
    setRefreshing(true);
    const usersRef = collection(db, "users");
    try {
      setDebugInfo("Actualizando lista...");
      const unsubscribeSnapshot = onSnapshot(usersRef, (querySnapshot) => {
        const usersData: UserData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({ uid: doc.id, ...data } as UserData);
        });
        usersData.sort((a, b) => (b.lastLogin || 0) - (a.lastLogin || 0));
        setUsers(usersData);
        setDebugInfo(`Última actualización: ${new Date().toLocaleTimeString()}`);
        setLoading(false);
        setRefreshing(false);
      }, (err) => {
        setError(`Error en tiempo real: ${err.message}`);
        setLoading(false);
        setRefreshing(false);
      });
      return unsubscribeSnapshot;
    } catch (err: any) {
      setError(`Error al conectar: ${err.message}`);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Verificación de sesión local primero
    const session = localStorage.getItem("fp_session");
    if (session) {
      const userData = JSON.parse(session);
      if (userData.email === "afiliadosprobusiness@gmail.com") {
        setAuthorized(true);
      } else {
        router.replace("/hub");
        return;
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth");
        return;
      }
  
      if (user.email !== "afiliadosprobusiness@gmail.com") {
        router.replace("/hub");
        return;
      }

      setAuthorized(true);
      
      // Sincronizar al propio admin si no existe en Firestore
      try {
        const adminRef = doc(db, "users", user.uid);
        await setDoc(adminRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Super Admin",
          lastLogin: Date.now(),
          role: "admin",
          status: "active"
        }, { merge: true });
      } catch (e) {
        console.error("Error sincronizando admin:", e);
      }

      // Cargar lista de usuarios
      const usersRef = collection(db, "users");
      setDebugInfo("Conectando con Firestore...");
      
      const unsubscribeSnapshot = onSnapshot(usersRef, (querySnapshot) => {
        console.log("Admin: Snapshot recibido con", querySnapshot.size, "documentos");
        
        if (querySnapshot.empty) {
          console.log("Admin: La colección está vacía");
          setDebugInfo("Base de datos conectada, pero vacía (0 usuarios).");
          setUsers([]);
        } else {
          const usersData: UserData[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Admin: Usuario encontrado ->", data.email);
            usersData.push({ uid: doc.id, ...data } as UserData);
          });
          
          // Ordenar por último acceso
          usersData.sort((a, b) => (b.lastLogin || 0) - (a.lastLogin || 0));
          setUsers(usersData);
          setDebugInfo(`Conectado. Usuarios en tabla: ${querySnapshot.size}`);
        }
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Admin: Error en onSnapshot:", err);
        setError(`Error de acceso a Firestore: ${err.message}. Verifica las reglas de seguridad.`);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [router]);

  // Ya no necesitamos fetchUsers manual ya que onSnapshot se encarga

  const updateUserStatus = async (uid: string, status: UserData['status']) => {
    try {
      await updateDoc(doc(db, "users", uid), { status });
      setUsers(users.map(u => u.uid === uid ? { ...u, status } : u));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const deleteUser = async (uid: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      setUsers(users.filter(u => u.uid !== uid));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("fp_session");
    router.push("/auth");
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-20 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Panel <span className="text-amber-500">Super Admin</span></h1>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Control Total del Sistema</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold">afiliadosprobusiness@gmail.com</p>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Sesión de Administrador</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
        {/* Stats & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-end justify-between">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Total Usuarios</p>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-[10px] text-zinc-600 mt-1">{debugInfo}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Activos</p>
              <p className="text-2xl font-bold text-emerald-500">{users.filter(u => u.status !== 'disabled' && u.status !== 'suspended').length}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Estado de Sincronización</p>
              <p className="text-sm font-medium text-emerald-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Sincronizado
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              disabled={refreshing}
              className="mt-2 text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              Forzar Actualización
            </button>
          </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-amber-500/50 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Usuario</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Registro</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Último Acceso</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
                      <p className="text-zinc-500 text-sm">Cargando base de datos...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl max-w-md mx-auto">
                        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-400 text-sm font-bold">Error de Conexión</p>
                        <p className="text-red-400/60 text-xs mt-1">{error}</p>
                        <p className="text-zinc-500 text-[10px] mt-4 uppercase tracking-widest">Verifica las reglas de Firestore o la consola</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="py-8">
                        <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm font-medium">No se encontraron usuarios en Firestore.</p>
                        <p className="text-zinc-600 text-xs mt-2 max-w-xs mx-auto">
                          Los usuarios de "Authentication" deben iniciar sesión al menos una vez para aparecer en este panel.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-zinc-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {user.name || "Sin nombre"}
                              {user.email === "afiliadosprobusiness@gmail.com" && (
                                <span className="ml-2 text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">ROOT</span>
                              )}
                            </p>
                            <p className="text-xs text-zinc-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.status === 'suspended' ? 'bg-orange-500/10 text-orange-500' :
                          user.status === 'disabled' ? 'bg-red-500/10 text-red-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-zinc-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-zinc-400">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Nunca"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.email !== "afiliadosprobusiness@gmail.com" ? (
                            <>
                              <button 
                                onClick={() => updateUserStatus(user.uid, user.status === 'suspended' ? 'active' : 'suspended')}
                                className={`p-2 rounded-lg transition-all ${user.status === 'suspended' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white'}`}
                                title={user.status === 'suspended' ? "Reactivar" : "Suspender"}
                              >
                                {user.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                              </button>
                              
                              <button 
                                onClick={() => updateUserStatus(user.uid, user.status === 'disabled' ? 'active' : 'disabled')}
                                className={`p-2 rounded-lg transition-all ${user.status === 'disabled' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500 hover:text-white'}`}
                                title={user.status === 'disabled' ? "Habilitar" : "Deshabilitar"}
                              >
                                {user.status === 'disabled' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                              </button>

                              <button 
                                onClick={() => deleteUser(user.uid)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                title="Eliminar Permanente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-zinc-600 font-medium px-2 py-1">SISTEMA PROTEGIDO</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
