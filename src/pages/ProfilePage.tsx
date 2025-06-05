
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import ProfileForm from '@/components/ProfileForm';

const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Meu Perfil</h1>
            <p className="text-sm sm:text-base text-gray-600">Gerencie suas informações pessoais</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm />
    </div>
  );
};

export default ProfilePage;
