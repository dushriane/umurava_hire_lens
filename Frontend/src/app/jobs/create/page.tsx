'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { createJob, updateFormDraft, selectFormDraft, selectJobsStatus, selectJobsError, clearError } from '@/store/jobsSlice'
import { CreateJobPayload, JobType, ExperienceLevel } from '@/types'
import Topbar from '@/components/Topbar'

const EMPTY_FORM: CreateJobPayload = {
  title: '',
  department: '',
  type: 'Full-time',
  location: '',
  experienceLevel: 'Mid-level (2–5 years)',
  salaryRange: '',
  description: '',
  requiredSkills: [],
  educationRequirements: '',
  idealCandidateProfile: '',
}

export default function CreateJobPage() {
  const dispatch   = useAppDispatch()
  const router     = useRouter()
  const draft      = useAppSelector(selectFormDraft)
  const status     = useAppSelector(selectJobsStatus)
  const error      = useAppSelector(selectJobsError)

  // Merge draft into initial form (so progress is not lost on refresh)
  const [form, setForm] = useState<CreateJobPayload>({ ...EMPTY_FORM, ...draft })
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof CreateJobPayload, string>>>({})

  // Clear API errors on unmount
  useEffect(() => () => { dispatch(clearError()) }, [dispatch])

  // Sync form changes to Redux draft (auto-save)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    setForm(updated)
    dispatch(updateFormDraft({ [name]: value }))
    // Clear field error on change
    if (errors[name as keyof CreateJobPayload]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // Tag input: press Enter to add a skill
  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      const skill = skillInput.trim()
      if (!form.requiredSkills.includes(skill)) {
        const updated = { ...form, requiredSkills: [...form.requiredSkills, skill] }
        setForm(updated)
        dispatch(updateFormDraft({ requiredSkills: updated.requiredSkills }))
      }
      setSkillInput('')
    }
  }

  const removeSkill = (idx: number) => {
    const updated = { ...form, requiredSkills: form.requiredSkills.filter((_, i) => i !== idx) }
    setForm(updated)
    dispatch(updateFormDraft({ requiredSkills: updated.requiredSkills }))
  }

  // Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!form.title.trim())       newErrors.title       = 'Job title is required'
    if (!form.location.trim())    newErrors.location    = 'Location is required'
    if (!form.description.trim()) newErrors.description = 'Job description is required'
    if (form.requiredSkills.length === 0) newErrors.requiredSkills = 'Add at least one skill'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const result = await dispatch(createJob(form))
    if (createJob.fulfilled.match(result)) {
      router.push('/screen?jobId=' + result.payload.id)
    }
  }

  const handleSaveDraft = () => {
    dispatch(updateFormDraft(form))
    alert('Draft saved!')
  }

  const isSubmitting = status === 'loading'

  return (
    <>
      <Topbar title="Create New Job" subtitle="Fill in the job details and requirements" />
      <div className="um-content">

        <div className="um-breadcrumb">
          <Link href="/jobs" className="um-breadcrumb-link">Job Listings</Link>
          <span style={{ color: 'var(--um-border)' }}>›</span>
          <span>Create New Job</span>
        </div>

        {/* API error */}
        {error && (
          <div style={{ background: 'var(--um-danger-bg)', color: 'var(--um-danger-text)', border: '1px solid #FEE2E2', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div className="um-card">
          <div className="um-card-title">Job Details</div>
          <div className="um-card-sub" style={{ marginBottom: 24 }}>
            Define the role, requirements, and ideal candidate profile for accurate AI screening
          </div>

          <div className="um-grid-2">

            {/* Title */}
            <div className="um-form-group">
              <label className="um-label">Job Title *</label>
              <input
                name="title" className="um-input"
                placeholder="e.g. Senior ML Engineer"
                value={form.title} onChange={handleChange}
                style={errors.title ? { borderColor: 'var(--um-danger)' } : {}}
              />
              {errors.title && <div style={{ color: 'var(--um-danger)', fontSize: 11, marginTop: 4 }}>{errors.title}</div>}
            </div>

            {/* Department */}
            <div className="um-form-group">
              <label className="um-label">Department</label>
              <select name="department" className="um-input" value={form.department} onChange={handleChange}>
                <option value="">Select department</option>
                <option>Engineering</option>
                <option>Data & AI</option>
                <option>Product</option>
                <option>Design</option>
                <option>Operations</option>
                <option>HR</option>
              </select>
            </div>

            {/* Type */}
            <div className="um-form-group">
              <label className="um-label">Employment Type</label>
              <select name="type" className="um-input" value={form.type} onChange={handleChange}>
                {(['Full-time', 'Part-time', 'Contract', 'Internship'] as JobType[]).map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="um-form-group">
              <label className="um-label">Location *</label>
              <input
                name="location" className="um-input"
                placeholder="e.g. Kigali, Rwanda / Remote – Africa"
                value={form.location} onChange={handleChange}
                style={errors.location ? { borderColor: 'var(--um-danger)' } : {}}
              />
              {errors.location && <div style={{ color: 'var(--um-danger)', fontSize: 11, marginTop: 4 }}>{errors.location}</div>}
            </div>

            {/* Experience */}
            <div className="um-form-group">
              <label className="um-label">Experience Level</label>
              <select name="experienceLevel" className="um-input" value={form.experienceLevel} onChange={handleChange}>
                {(['Junior (0–2 years)', 'Mid-level (2–5 years)', 'Senior (5+ years)', 'Lead / Principal'] as ExperienceLevel[]).map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div className="um-form-group">
              <label className="um-label">Salary Range (RWF / month)</label>
              <input
                name="salaryRange" className="um-input"
                placeholder="e.g. 500,000 – 800,000 RWF"
                value={form.salaryRange} onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="um-form-group um-full-col">
              <label className="um-label">Job Description *</label>
              <textarea
                name="description" className="um-input" rows={4}
                placeholder="Describe the role, responsibilities, and what the candidate will be doing day-to-day..."
                value={form.description} onChange={handleChange}
                style={errors.description ? { borderColor: 'var(--um-danger)' } : {}}
              />
              {errors.description && <div style={{ color: 'var(--um-danger)', fontSize: 11, marginTop: 4 }}>{errors.description}</div>}
            </div>

            {/* Skills tag input */}
            <div className="um-form-group um-full-col">
              <label className="um-label">
                Required Skills *{' '}
                <span style={{ fontWeight: 400, color: 'var(--um-muted)', fontSize: 11, textTransform: 'none' }}>
                  — type a skill and press Enter
                </span>
              </label>
              <div
                className="um-tag-wrap"
                style={errors.requiredSkills ? { borderColor: 'var(--um-danger)' } : {}}
                onClick={() => document.getElementById('skills-input')?.focus()}
              >
                {form.requiredSkills.map((skill, i) => (
                  <span key={i} className="um-tag">
                    {skill}
                    <span className="um-tag-remove" onClick={() => removeSkill(i)}>×</span>
                  </span>
                ))}
                <input
                  id="skills-input"
                  style={{ border: 'none', outline: 'none', padding: 0, minWidth: 100, flex: 1, background: 'transparent', fontSize: 13, fontFamily: 'inherit' }}
                  placeholder={form.requiredSkills.length === 0 ? 'e.g. Python, TensorFlow, MLOps...' : ''}
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                />
              </div>
              {errors.requiredSkills && <div style={{ color: 'var(--um-danger)', fontSize: 11, marginTop: 4 }}>{errors.requiredSkills}</div>}
            </div>

            {/* Education */}
            <div className="um-form-group um-full-col">
              <label className="um-label">Education Requirements</label>
              <input
                name="educationRequirements" className="um-input"
                placeholder="e.g. Bachelor's in CS, Data Science, or related field"
                value={form.educationRequirements} onChange={handleChange}
              />
            </div>

            {/* Ideal candidate */}
            <div className="um-form-group um-full-col">
              <label className="um-label">
                Ideal Candidate Profile{' '}
                <span style={{ fontWeight: 400, color: 'var(--um-muted)', fontSize: 11, textTransform: 'none' }}>
                  — helps Gemini AI screen more accurately
                </span>
              </label>
              <textarea
                name="idealCandidateProfile" className="um-input" rows={3}
                placeholder="Describe the perfect candidate — their background, mindset, soft skills, and what sets them apart..."
                value={form.idealCandidateProfile} onChange={handleChange}
              />
            </div>

          </div>

          <div className="um-divider" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="um-btn um-btn-ghost" onClick={handleSaveDraft} disabled={isSubmitting}>
              Save Draft
            </button>
            <button
              className="um-btn um-btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'um-spin 0.8s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  Save & Go to Screening
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  )
}