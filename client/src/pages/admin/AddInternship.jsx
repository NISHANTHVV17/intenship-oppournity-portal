import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import InternshipForm from '../../components/InternshipForm';

function AddInternship() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleCreate = async (data) => {
    try {
      await api.post('/internships', data);
      showToast('Internship created successfully.', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      showToast(getErrorMessage(error), 'danger');
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <h1 className="h3 fw-bold mb-1">Add Internship</h1>
          <p className="text-muted mb-4">Fill in the details below to post a new internship.</p>
          <div className="card p-4">
            <InternshipForm onSubmit={handleCreate} submitText="Create Internship" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddInternship;
