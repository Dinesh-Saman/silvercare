exports.getByUserId = async (req, res) => {
  const userId = req.params.userId;
  // TODO: Replace with real DB lookup
  // Placeholder data for demonstration
  const hp = {
    user_id: userId,
    name: 'Demo Health Professional',
    email: 'demo@healthpro.com',
    phone: '1234567890',
    specialization: 'Mental Health',
    license_number: 'HP-12345',
    alternative_number: '0987654321',
    current_institution: 'SilverCare Clinic',
    proof: '',
    years_experience: 5,
    status: 'approved',
    district: 'Colombo',
    created_at: new Date().toISOString()
  };
  res.json({ healthprofessional: hp });
}; 