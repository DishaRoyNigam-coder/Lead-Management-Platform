const Lead = require('../models/Lead');

// @desc    Get leads (role-based)
const getLeads = async (req, res) => {
  let query = {};
  // Normal users only see their own leads
  if (req.user.role !== 'admin') {
    query = { createdBy: req.user._id };
  }

  // Bonus: Search & filter
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Bonus: Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Lead.countDocuments(query);
  const leads = await Lead.find(query)
    .populate('createdBy', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    leads,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
};

// @desc    Create a lead
const createLead = async (req, res) => {
  const { name, email, phone, description, status } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  const lead = await Lead.create({
    name,
    email,
    phone,
    description,
    status: status || 'New',
    createdBy: req.user._id, // Associate lead with the logged-in user
  });

  res.status(201).json(lead);
};

// @desc    Update lead status
const updateLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  // Authorization: Only owner or admin can update
  if (lead.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this lead' });
  }

  const updatedLead = await Lead.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.json(updatedLead);
};

// @desc    Delete a lead
const deleteLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  if (lead.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this lead' });
  }

  await lead.deleteOne();
  res.json({ message: 'Lead removed' });
};

module.exports = { getLeads, createLead, updateLead, deleteLead };