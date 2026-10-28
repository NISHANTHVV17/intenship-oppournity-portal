import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import InternshipForm from '../../components/InternshipForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function EditInternship() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the internship we are editing
  useEffect(() => {
    api
      .get(`/internships/${id}`)
      .then((res) => setInternship(res.data))
      .catch((error) => {
        if (!error.response || error.response.status !== 404) {
          showToast(getErrorMessage(error), 'danger');
        }
      })
      .finally(() => setLoading(false));
  }, [id, showToast]);

  const handleUpdate = async (data) => {
    try {
      await api.put(`/internships/${id}`, data);
      showToast('Internship updated successfully.', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      showToast(getErrorMessage(error), 'danger');
    }
  };

  if (loading) return <LoadingSpinner text="Loading internship..." />;

  if (!internship) {
    return (
      <div className="container py-5">
        <EmptyState icon="bi-briefcase" title="Internship not found">
          <Link to="/admin/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <h1 className="h3 fw-bold mb-1">Edit Internship</h1>
          <p className="text-muted mb-4">Update the details of “{internship.title}”.</p>
          <div className="card p-4">
            <InternshipForm initialValues={internship} onSubmit={handleUpdate} submitText="Update Internship" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditInternship;
