import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { notifyParentInattentive } from '../utils/notifyParent';

const AVATARS = [
  { id: 'avatar1', label: 'Star', src: '/images/avatar-star.png' },
  { id: 'avatar2', label: 'Rocket', src: '/images/avatar-rocket.png' },
  { id: 'avatar3', label: 'Panda', src: '/images/avatar-panda.png' },
];

const LOGIN_ICON_CHOICES = [
  { id: 'icon1', label: 'Sun', src: '/images/avatar - balloon.png' },
  { id: 'icon2', label: 'Balloon', src: '/images/avatar-panda.png' },
  { id: 'icon3', label: 'Car', src: '/images/avatar-rocket.png' },
  { id: 'icon4', label: 'Train', src: '/images/avatar-sun.png' },
  { id: 'icon5', label: 'Flower', src: '/images/avatar-sun.png' },
  { id: 'icon6', label: 'Rainbow', src: '/images/avatar-rainbow.png' },
];

function useVoiceAssistant() {
  const speak = (text) => {
    if (!text) return;
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const playConfirmationTone = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.2;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, 180);
  };

  return { speak, playConfirmationTone };
}

const CameraMonitor = () => {
  const videoRef = React.useRef(null);

  useEffect(() => {
    let stream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Camera access denied or unavailable', error);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div style={styles.cameraPlaceholder}>
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover' }}
        muted
        playsInline
      />
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { registeredChild: globalChild, setRegisteredChild: setGlobalRegisteredChild } = useApp();
  const [mode, setMode] = useState('parent');

  const [childName, setChildName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [selectedLoginIconIds, setSelectedLoginIconIds] = useState([]);
  const [classType, setClassType] = useState(null);
  const [grade, setGrade] = useState(null);
  const PRIMARY_GRADES = [1, 2, 3, 4, 5];
  const SECONDARY_GRADES = [6, 7, 8, 9, 10, 11, 12];

  // Multi-child support: list of registered children + which one is active
  const [registeredChildren, setRegisteredChildren] = useState(globalChild ? [globalChild] : []);
  const [selectedChildIndex, setSelectedChildIndex] = useState(null);

  const { speak, playConfirmationTone } = useVoiceAssistant();

  // Voice instructions when mode changes
  useEffect(() => {
    if (mode === 'parent') {
      speak('Welcome to Level Up Learning. Please register your child by entering their name, choosing an avatar, and selecting the login pictures.');
    } else if (selectedChildIndex !== null) {
      const child = registeredChildren[selectedChildIndex];
      const classLabel = child.classType === 'primary' ? 'primary' : 'secondary';
      speak(`Hello ${child.childName}. You are logging in as ${classLabel} class ${child.grade} student. Click one of your pictures to log in.`);
    } else if (registeredChildren.length === 0) {
      speak('Please ask your parent or mentor to help you set up your login.');
    }
  }, [mode, selectedChildIndex, registeredChildren, speak]);

  const toggleMode = (newMode) => setMode(newMode);

  const handleAvatarSelect = (avatarId, label) => {
    setSelectedAvatarId(avatarId);
    speak(`Avatar ${label} selected.`);
    playConfirmationTone();
  };

  const handleLoginIconToggle = (iconId, label) => {
    setSelectedLoginIconIds((prev) => {
      let next;
      if (prev.includes(iconId)) {
        next = prev.filter((id) => id !== iconId);
      } else {
        next = [...prev, iconId];
      }
      speak(`Picture ${label} ${prev.includes(iconId) ? 'removed' : 'selected'}.`);
      playConfirmationTone();
      return next;
    });
  };

  const canSubmitRegistration =
    childName.trim().length > 0 &&
    parentEmail.trim().length > 0 &&
    selectedAvatarId &&
    selectedLoginIconIds.length >= 4 &&
    selectedLoginIconIds.length <= 6 &&
    classType &&
    grade !== null;

  const handleRegister = (e) => {
    e.preventDefault();
    if (!canSubmitRegistration) return;

    const avatar = AVATARS.find((a) => a.id === selectedAvatarId);
    const icons = LOGIN_ICON_CHOICES.filter((icon) => selectedLoginIconIds.includes(icon.id));

    const registration = {
      childName: childName.trim(),
      parentEmail: parentEmail.trim(),
      avatar,
      loginIcons: icons,
      classType,
      grade,
    };

    setRegisteredChildren((prev) => [...prev, registration]);

    speak(`Thank you. ${registration.childName} has been registered. You can now use the child login with the selected pictures.`);
    playConfirmationTone();

    setMode('child');
  };

  const handleChildIconClick = (icon) => {
    const child = registeredChildren[selectedChildIndex];
    const classLabel = child.classType === 'primary' ? 'primary' : 'secondary';
    const loginMessage = `You are logged in as ${classLabel} class ${child.grade} student. Welcome ${child.childName}.`;
    speak(loginMessage);
    playConfirmationTone();
    setGlobalRegisteredChild(child);
    navigate('/home');
  };

  const handleInattentive = useCallback(() => {
    speak('You are not alert. Please look at the screen.');
    playConfirmationTone();
    const child = selectedChildIndex !== null ? registeredChildren[selectedChildIndex] : null;
    if (child?.parentEmail) {
      notifyParentInattentive(child.parentEmail, child.childName);
    }
  }, [speak, playConfirmationTone, registeredChildren, selectedChildIndex]);

  useEffect(() => {
    if (mode !== 'child' || selectedChildIndex === null) return;
    const intervalMs = 20 * 1000;
    const id = setInterval(handleInattentive, intervalMs);
    return () => clearInterval(id);
  }, [mode, selectedChildIndex, handleInattentive]);

  return (
    <main style={styles.page} aria-label="Level Up Learning Login Page for children with mild autism">
      <section style={styles.mainPanel}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Level Up Learning</h1>
            <p style={styles.subtitle}>Gentle, picture-based login for young learners.</p>
          </div>
          <nav aria-label="Select login mode" style={styles.modeToggle}>
            <button
              type="button"
              style={{ ...styles.modeButton, ...(mode === 'parent' ? styles.modeButtonActive : {}) }}
              onClick={() => toggleMode('parent')}
            >
              Parent / Mentor
            </button>
            <button
              type="button"
              style={{ ...styles.modeButton, ...(mode === 'child' ? styles.modeButtonActive : {}) }}
              onClick={() => toggleMode('child')}
            >
              Child Login
            </button>
          </nav>
        </header>

        {mode === 'parent' && (
          <section style={styles.card} aria-label="Parent or mentor registration">
            <form onSubmit={handleRegister} style={styles.form}>
              <div style={styles.formGroup}>
                <label htmlFor="childName" style={styles.label}>Child&apos;s Name</label>
                <input
                  id="childName"
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  style={styles.largeInput}
                  placeholder="Type your child's name"
                />
              </div>

              <section aria-label="Choose an avatar" style={styles.formGroup}>
                <h2 style={styles.sectionTitle}>Choose an Avatar</h2>
                <div style={styles.avatarGrid}>
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleAvatarSelect(avatar.id, avatar.label)}
                      style={{ ...styles.avatarButton, ...(selectedAvatarId === avatar.id ? styles.avatarButtonSelected : {}) }}
                    >
                      <img src={avatar.src} alt={avatar.label} style={styles.avatarImage} />
                      <span style={styles.avatarLabel}>{avatar.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section aria-label="Select class type" style={styles.formGroup}>
                <h2 style={styles.sectionTitle}>Class Type</h2>
                <p style={styles.helperText}>Is your child in primary (1–5) or secondary (6–12)?</p>
                <div style={styles.classTypeRow}>
                  <button
                    type="button"
                    onClick={() => {
                      setClassType('primary');
                      setGrade(null);
                      speak('Primary class selected. Now choose grade 1 to 5.');
                      playConfirmationTone();
                    }}
                    style={{ ...styles.classTypeButton, ...(classType === 'primary' ? styles.classTypeButtonActive : {}) }}
                  >
                    Primary (1–5)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClassType('secondary');
                      setGrade(null);
                      speak('Secondary class selected. Now choose grade 6 to 12.');
                      playConfirmationTone();
                    }}
                    style={{ ...styles.classTypeButton, ...(classType === 'secondary' ? styles.classTypeButtonActive : {}) }}
                  >
                    Secondary (6–12)
                  </button>
                </div>
              </section>

              {classType && (
                <section aria-label="Select grade" style={styles.formGroup}>
                  <h2 style={styles.sectionTitle}>
                    {classType === 'primary' ? 'Select Grade (1–5)' : 'Select Grade (6–12)'}
                  </h2>
                  <div style={styles.gradeRow}>
                    {(classType === 'primary' ? PRIMARY_GRADES : SECONDARY_GRADES).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setGrade(g);
                          speak(`Grade ${g} selected.`);
                          playConfirmationTone();
                        }}
                        style={{ ...styles.gradeButton, ...(grade === g ? styles.gradeButtonActive : {}) }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <div style={styles.formGroup}>
                <label htmlFor="parentEmail" style={styles.label}>Parent / Mentor Email</label>
                <input
                  id="parentEmail"
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  style={styles.largeInput}
                  placeholder="you@example.com"
                />
              </div>

              <section aria-label="Select pictures for child login" style={styles.formGroup}>
                <h2 style={styles.sectionTitle}>Select 4–6 Pictures for Child Login</h2>
                <p style={styles.helperText}>Your child will click one of these pictures to log in. No typing needed.</p>
                <div style={styles.iconGrid}>
                  {LOGIN_ICON_CHOICES.map((icon) => {
                    const isSelected = selectedLoginIconIds.includes(icon.id);
                    return (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => handleLoginIconToggle(icon.id, icon.label)}
                        style={{ ...styles.iconButton, ...(isSelected ? styles.iconButtonSelected : {}) }}
                      >
                        <img src={icon.src} alt={icon.label} style={styles.iconImage} />
                        <span style={styles.iconLabel}>{icon.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p style={styles.helperText}>Selected: {selectedLoginIconIds.length} (need 4–6)</p>
              </section>

              <div style={styles.submitRow}>
                <button
                  type="submit"
                  style={{ ...styles.primaryButton, ...(canSubmitRegistration ? {} : styles.buttonDisabled) }}
                  disabled={!canSubmitRegistration}
                >
                  Save &amp; Enable Child Login
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Child Login flow — Step 1: pick which child */}
        {mode === 'child' && selectedChildIndex === null && (
          <section style={styles.card} aria-label="Choose your profile">
            <h2 style={styles.sectionTitle}>Who's using this?</h2>
            {registeredChildren.length === 0 ? (
              <p style={styles.helperText}>
                A parent or mentor needs to set up your pictures first on this device. Please ask them to tap the &quot;Parent / Mentor&quot; button.
              </p>
            ) : (
              <div style={styles.avatarGrid}>
                {registeredChildren.map((child, index) => (
                  <button
                    key={child.childName}
                    type="button"
                    onClick={() => setSelectedChildIndex(index)}
                    style={styles.avatarButton}
                  >
                    <img src={child.avatar.src} alt={child.avatar.label} style={styles.avatarImage} />
                    <span style={styles.avatarLabel}>{child.childName}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Child Login flow — Step 2: image challenge for the selected child */}
        {mode === 'child' && selectedChildIndex !== null && (
          <section style={styles.card} aria-label="Child login">
            <div>
              <header style={styles.childHeader}>
                <div style={styles.childAvatarWrapper}>
                  <img
                    src={registeredChildren[selectedChildIndex].avatar.src}
                    alt={registeredChildren[selectedChildIndex].avatar.label}
                    style={styles.childAvatar}
                  />
                </div>
                <div>
                  <h2 style={styles.sectionTitle}>Hello {registeredChildren[selectedChildIndex].childName}!</h2>
                  <p style={styles.helperText}>
                    You are logging in as {registeredChildren[selectedChildIndex].classType === 'primary' ? 'primary' : 'secondary'} class {registeredChildren[selectedChildIndex].grade} student.
                  </p>
                  <p style={styles.helperText}>Click one of your pictures to log in.</p>
                </div>
              </header>

              <section aria-label="Choose a picture to log in" style={styles.iconGrid}>
                {registeredChildren[selectedChildIndex].loginIcons.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    style={styles.iconButton}
                    onClick={() => handleChildIconClick(icon)}
                  >
                    <img src={icon.src} alt={icon.label} style={styles.iconImage} />
                    <span style={styles.iconLabel}>{icon.label}</span>
                  </button>
                ))}
              </section>
            </div>
          </section>
        )}
      </section>

      <aside style={styles.cameraPanel} aria-label="Camera monitoring area">
        <section style={styles.cameraCard}>
          <h2 style={styles.sectionTitle}>Attention Monitor</h2>
          <p style={styles.helperText}>
            The camera gently watches to see if you are looking at the screen and staying engaged. This helps your grown‑ups understand how you are doing.
          </p>
          <CameraMonitor />
        </section>

        <section style={styles.infoCard}>
          <p style={styles.helperText}>
            This login is designed for children with mild autism. It uses large pictures, simple steps, a voice guide, and gentle monitoring to keep things calm and supportive.
          </p>
        </section>
      </aside>
    </main>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'row', padding: '32px', boxSizing: 'border-box', background: 'linear-gradient(135deg, #FFD6B3, #FFE0CC)', fontFamily: '"Nunito", system-ui, -apple-system, BlinkMacSystemFont, sans-serif', color: '#333', gap: '24px' },
  mainPanel: { flex: 2, display: 'flex', flexDirection: 'column', gap: '16px' },
  cameraPanel: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' },
  title: { fontSize: '2.5rem', margin: 0 },
  subtitle: { fontSize: '1.1rem', marginTop: '4px' },
  modeToggle: { display: 'flex', gap: '8px' },
  modeButton: { padding: '12px 18px', borderRadius: '999px', border: '2px solid #FFFFFFaa', background: '#ffffff66', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#333', transition: 'background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' },
  modeButtonActive: { background: '#2ECC71', color: '#fff', borderColor: '#2ECC71', boxShadow: '0 6px 18px rgba(46, 204, 113, 0.4)', transform: 'translateY(-1px)' },
  card: { borderRadius: '24px', background: '#fff', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
  cameraCard: { borderRadius: '24px', background: '#fff', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
  infoCard: { borderRadius: '24px', background: '#ffffffaa', padding: '16px 20px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '1.1rem', fontWeight: 600 },
  largeInput: { padding: '14px 16px', borderRadius: '18px', border: '2px solid #FFE0CC', fontSize: '1.1rem', outline: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: '1.4rem', margin: 0 },
  helperText: { fontSize: '1rem', margin: 0, color: '#555' },
  avatarGrid: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  avatarButton: { flex: '0 0 110px', borderRadius: '20px', border: '2px solid transparent', background: '#FFF7F0', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s ease, box-shadow 0.15s ease, border-color 0.15s ease', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  avatarButtonSelected: { borderColor: '#2ECC71', boxShadow: '0 6px 16px rgba(46, 204, 113, 0.4)', transform: 'translateY(-1px)' },
  avatarImage: { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', marginBottom: '6px' },
  avatarLabel: { fontSize: '0.95rem', fontWeight: 600 },
  classTypeRow: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  classTypeButton: { padding: '16px 24px', borderRadius: '999px', border: '2px solid #FFE0CC', background: '#FFF7F0', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  classTypeButtonActive: { borderColor: '#2ECC71', backgroundColor: '#2ECC71', color: '#fff', boxShadow: '0 6px 18px rgba(46, 204, 113, 0.4)' },
  gradeRow: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  gradeButton: { width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #FFE0CC', background: '#FFF7F0', fontSize: '1.25rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  gradeButtonActive: { borderColor: '#2ECC71', backgroundColor: '#2ECC71', color: '#fff', boxShadow: '0 6px 18px rgba(46, 204, 113, 0.4)' },
  iconGrid: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' },
  iconButton: { flex: '0 0 110px', borderRadius: '22px', border: '2px solid transparent', background: '#FFF7F0', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s ease, box-shadow 0.15s ease, border-color 0.15s ease', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  iconButtonSelected: { borderColor: '#2ECC71', boxShadow: '0 6px 16px rgba(46, 204, 113, 0.4)', transform: 'translateY(-1px)' },
  iconImage: { width: '72px', height: '72px', borderRadius: '20px', objectFit: 'cover', marginBottom: '6px' },
  iconLabel: { fontSize: '0.95rem', fontWeight: 600 },
  submitRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '8px' },
  primaryButton: { padding: '16px 28px', borderRadius: '999px', border: 'none', backgroundColor: '#2ECC71', color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 24px rgba(46, 204, 113, 0.45)', transition: 'background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease' },
  buttonDisabled: { opacity: 0.6, cursor: 'not-allowed', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  childHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' },
  childAvatarWrapper: { width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
  childAvatar: { width: '100%', height: '100%', objectFit: 'cover' },
  cameraPlaceholder: { marginTop: '12px', borderRadius: '18px', border: '2px dashed #FFBFA3', background: '#FFF7F0', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cameraPlaceholderText: { fontSize: '1rem', color: '#777' },
};

export default LoginPage;