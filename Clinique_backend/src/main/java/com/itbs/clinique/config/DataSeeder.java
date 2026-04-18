package com.itbs.clinique.config;

import com.itbs.clinique.entities.*;
import com.itbs.clinique.repositories.*;
import com.itbs.clinique.services.DossierMedicalService;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final SpecialiteRepository specialiteRepository;
    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;
    private final PatientRepository patientRepository;
    private final RendezVousRepository rendezVousRepository;
    private final ConsultationRepository consultationRepository;
    private final NotificationRepository notificationRepository;

    private final PasswordEncoder passwordEncoder;
    private final DossierMedicalService dossierMedicalService;

    public DataSeeder(
            RoleRepository roleRepository,
            SpecialiteRepository specialiteRepository,
            UserRepository userRepository,
            MedecinRepository medecinRepository,
            PatientRepository patientRepository,
            RendezVousRepository rendezVousRepository,
            ConsultationRepository consultationRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder,
            DossierMedicalService dossierMedicalService
    ) {
        this.roleRepository = roleRepository;
        this.specialiteRepository = specialiteRepository;
        this.userRepository = userRepository;
        this.medecinRepository = medecinRepository;
        this.patientRepository = patientRepository;
        this.rendezVousRepository = rendezVousRepository;
        this.consultationRepository = consultationRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.dossierMedicalService = dossierMedicalService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Always ensure reference data exists
        Role roleAdmin = getOrCreateRole("ADMIN");
        Role roleMedecin = getOrCreateRole("MEDECIN");
        Role rolePatient = getOrCreateRole("PATIENT");

        Specialite cardio = getOrCreateSpecialite("Cardiologie");
        Specialite dermato = getOrCreateSpecialite("Dermatologie");
        Specialite pediatrie = getOrCreateSpecialite("Pédiatrie");
        Specialite gyneco = getOrCreateSpecialite("Gynécologie");
        Specialite orl = getOrCreateSpecialite("ORL");
        Specialite ophta = getOrCreateSpecialite("Ophtalmologie");
        Specialite gastro = getOrCreateSpecialite("Gastro-entérologie");
        Specialite endo = getOrCreateSpecialite("Endocrinologie");

        // Only create demo data when DB is empty-ish
        if (userRepository.count() > 0 || medecinRepository.count() > 0 || patientRepository.count() > 0) {
            return;
        }

        // ===== Admin account =====
        createUser(
                "admin@clinique.ma",
                "admin123",
                "EL IDRISSI",
                "Salma",
                "0612345678",
                roleAdmin
        );

        // ===== Doctors =====
        Medecin drAmina = createMedecin(
                "dr.amina.ouazzani@clinique.ma",
                "clinic123",
                "OUAZZANI",
                "Amina",
                "0622001100",
                cardio,
                roleMedecin
        );
        Medecin drYoussef = createMedecin(
                "dr.youssef.benali@clinique.ma",
                "clinic123",
                "BENALI",
                "Youssef",
                "0622002200",
                dermato,
                roleMedecin
        );
        Medecin drNadia = createMedecin(
                "dr.nadia.karim@clinique.ma",
                "clinic123",
                "KARIM",
                "Nadia",
                "0622003300",
                pediatrie,
                roleMedecin
        );
        Medecin drHicham = createMedecin(
                "dr.hicham.elmoussaoui@clinique.ma",
                "clinic123",
                "EL MOUSSAOUI",
                "Hicham",
                "0622004400",
                ophta,
                roleMedecin
        );

        // ===== Patients =====
        Patient pSara = createPatient(
                "sara.benomar@gmail.com",
                "patient123",
                "BENOMAR",
                "Sara",
                "0670010203",
                LocalDate.of(1997, 3, 12),
                "Antécédents: anémie légère (2018). Allergies: aucune connue.",
                rolePatient
        );
        Patient pOmar = createPatient(
                "omar.elhaddad@gmail.com",
                "patient123",
                "EL HADDAD",
                "Omar",
                "0670040506",
                LocalDate.of(1988, 11, 4),
                "Antécédents: asthme intermittent. Allergies: pollen.",
                rolePatient
        );
        Patient pIkram = createPatient(
                "ikram.fassi@gmail.com",
                "patient123",
                "FASSI",
                "Ikram",
                "0670070809",
                LocalDate.of(2001, 7, 28),
                "Vaccins à jour. Antécédents familiaux: diabète type 2.",
                rolePatient
        );
        Patient pMehdi = createPatient(
                "mehdi.zouaoui@gmail.com",
                "patient123",
                "ZOUAOUI",
                "Mehdi",
                "0670101112",
                LocalDate.of(1979, 1, 19),
                "HTA légère sous surveillance. IMC élevé.",
                rolePatient
        );
        Patient pHajar = createPatient(
                "hajar.alaoui@gmail.com",
                "patient123",
                "ALAOUI",
                "Hajar",
                "0670131415",
                LocalDate.of(1993, 9, 2),
                "Allergies: pénicilline. Antécédents: migraine.",
                rolePatient
        );
        Patient pRania = createPatient(
                "rania.boukhari@gmail.com",
                "patient123",
                "BOUKHARI",
                "Rania",
                "0670161718",
                LocalDate.of(1990, 5, 14),
                "Antécédents: hypothyroïdie traitée. Dernier bilan: stable.",
                rolePatient
        );
        Patient pAnas = createPatient(
                "anas.elkadi@gmail.com",
                "patient123",
                "EL KADI",
                "Anas",
                "0670192021",
                LocalDate.of(2004, 12, 9),
                "Sportif. Aucun antécédent notable.",
                rolePatient
        );
        Patient pMariam = createPatient(
                "mariam.cherkaoui@gmail.com",
                "patient123",
                "CHERKAOUI",
                "Mariam",
                "0670222324",
                LocalDate.of(1985, 8, 23),
                "Antécédents: gastrite. Allergies: AINS.",
                rolePatient
        );

        // ===== Rendez-vous & consultations =====
        // Past finished consultations
        RendezVous rdv1 = createRendezVous(pSara, drAmina, LocalDate.now().minusDays(14), "09:00", "Douleurs thoraciques", "TERMINE");
        Consultation c1 = createConsultation(rdv1,
                "Douleur thoracique atypique, ECG normal.",
                "Paracétamol si douleur. Repos.",
                "Hydratation, éviter effort intense 48h.",
                "Contrôle si récidive.",
                250, 60, "PAYE");
        dossierMedicalService.mettreAJourDossierApresConsultation(c1);
        createNotificationForFacture(pSara, c1, LocalDate.now().minusDays(14));

        RendezVous rdv2 = createRendezVous(pOmar, drYoussef, LocalDate.now().minusDays(10), "10:30", "Éruption cutanée", "TERMINE");
        Consultation c2 = createConsultation(rdv2,
                "Dermatite de contact probable.",
                "Crème hydrocortisone 1% 2x/j 5 jours.",
                "Éviter irritants, savon doux.",
                "Suivi dans 2 semaines.",
                200, 80, "EN_ATTENTE");
        dossierMedicalService.mettreAJourDossierApresConsultation(c2);
        createNotificationForFacture(pOmar, c2, LocalDate.now().minusDays(10));

        RendezVous rdv3 = createRendezVous(pIkram, drNadia, LocalDate.now().minusDays(7), "11:00", "Fièvre et toux", "TERMINE");
        Consultation c3 = createConsultation(rdv3,
                "Infection virale des voies respiratoires supérieures.",
                "Si fièvre: paracétamol. Lavage nasal.",
                "Repos 3 jours.",
                "Revenir si aggravation.",
                180, 40, "PAYE");
        dossierMedicalService.mettreAJourDossierApresConsultation(c3);
        createNotificationForFacture(pIkram, c3, LocalDate.now().minusDays(7));

        // Future / pending
        RendezVous rdv4 = createRendezVous(pMehdi, drAmina, LocalDate.now().plusDays(2), "09:30", "Contrôle tension artérielle", "CONFIRME");
        createNotificationForConfirmation(pMehdi, rdv4, LocalDate.now().minusDays(1));

        RendezVous rdv5 = createRendezVous(pHajar, drHicham, LocalDate.now().plusDays(3), "14:00", "Baisse vision / fatigue visuelle", "EN_ATTENTE");
        createNotificationForDemande(pHajar, rdv5, LocalDate.now());
        createNotificationForNouveauRdvMedecin(drHicham, rdv5, LocalDate.now());

        RendezVous rdv6 = createRendezVous(pRania, drAmina, LocalDate.now().plusDays(5), "10:00", "Palpitations", "CONFIRME");
        createNotificationForConfirmation(pRania, rdv6, LocalDate.now());

        RendezVous rdv7 = createRendezVous(pAnas, drYoussef, LocalDate.now().plusDays(6), "15:30", "Acné persistante", "EN_ATTENTE");
        createNotificationForDemande(pAnas, rdv7, LocalDate.now());
        createNotificationForNouveauRdvMedecin(drYoussef, rdv7, LocalDate.now());

        RendezVous rdv8 = createRendezVous(pMariam, drNadia, LocalDate.now().plusDays(8), "09:00", "Contrôle enfant (vaccins)", "ANNULE");
        createNotificationForAnnulation(pMariam, rdv8, LocalDate.now().minusDays(1), "ANNULATION_PAR_MEDECIN");

        // A couple more to diversify specialties table usage
        createRendezVous(pSara, drNadia, LocalDate.now().plusDays(12), "11:30", "Suivi enfant (rhume)", "EN_ATTENTE");
        createRendezVous(pOmar, drHicham, LocalDate.now().plusDays(15), "16:00", "Contrôle lunettes", "CONFIRME");

        // Extra specialities referenced by UI lists (not necessarily used by doctors)
        getOrCreateSpecialite(gyneco.getNom());
        getOrCreateSpecialite(orl.getNom());
        getOrCreateSpecialite(gastro.getNom());
        getOrCreateSpecialite(endo.getNom());
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByRole(roleName)
                .orElseGet(() -> roleRepository.save(new Role(null, roleName)));
    }

    private Specialite getOrCreateSpecialite(String nom) {
        return specialiteRepository.findByNom(nom)
                .orElseGet(() -> specialiteRepository.save(new Specialite(null, nom)));
    }

    private User createUser(
            String email,
            String rawPassword,
            String nom,
            String prenom,
            String tel,
            Role role
    ) {
        User u = new User();
        u.setUsername(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setNom(nom);
        u.setPrenom(prenom);
        u.setTel(tel);
        u.setEnabled(true);
        u.setRoles(List.of(role));
        return userRepository.save(u);
    }

    private Medecin createMedecin(
            String email,
            String rawPassword,
            String nom,
            String prenom,
            String tel,
            Specialite specialite,
            Role roleMedecin
    ) {
        User user = createUser(email, rawPassword, nom, prenom, tel, roleMedecin);
        Medecin m = new Medecin();
        m.setUser(user);
        m.setSpecialiteRef(specialite);
        m.setSpecialite(specialite.getNom());
        return medecinRepository.save(m);
    }

    private Patient createPatient(
            String email,
            String rawPassword,
            String nom,
            String prenom,
            String tel,
            LocalDate dateNaissance,
            String dossierMedical,
            Role rolePatient
    ) {
        User user = createUser(email, rawPassword, nom, prenom, tel, rolePatient);
        Patient p = new Patient();
        p.setUser(user);
        p.setDateNaissance(toDate(dateNaissance));
        p.setDossierMedical(dossierMedical);
        return patientRepository.save(p);
    }

    private RendezVous createRendezVous(
            Patient patient,
            Medecin medecin,
            LocalDate date,
            String heure,
            String motif,
            String statut
    ) {
        RendezVous rdv = new RendezVous();
        rdv.setPatient(patient);
        rdv.setMedecin(medecin);
        rdv.setDate(toDate(date));
        rdv.setHeure(heure);
        rdv.setMotif(motif);
        rdv.setStatut(statut);
        return rendezVousRepository.save(rdv);
    }

    private Consultation createConsultation(
            RendezVous rdv,
            String diagnostic,
            String ordonnance,
            String traitement,
            String notes,
            double prixConsultation,
            double montantMedicaments,
            String statutPaiement
    ) {
        Consultation c = new Consultation();
        c.setRendezVous(rdv);
        c.setDiagnostic(diagnostic);
        c.setOrdonnance(ordonnance);
        c.setTraitement(traitement);
        c.setNotes(notes);
        c.setPrixConsultation(prixConsultation);
        c.setMontantMedicaments(montantMedicaments);
        c.calculerTotal();
        c.setStatutPaiement(statutPaiement);
        Consultation saved = consultationRepository.save(c);

        // Keep RDV coherent with consultation
        if (!"TERMINE".equals(rdv.getStatut())) {
            rdv.setStatut("TERMINE");
            rendezVousRepository.save(rdv);
        }

        return saved;
    }

    private void createNotificationForDemande(Patient patient, RendezVous rdv, LocalDate sentAt) {
        String message = String.format(
                "⏳ Demande envoyée: Votre demande de rendez-vous avec Dr. %s pour le %s à %s est en attente de confirmation.",
                rdv.getMedecin().getNomComplet(),
                formatDate(rdv.getDate()),
                rdv.getHeure()
        );
        notificationRepository.save(notification(patient, null, rdv, message, "DEMANDE_EN_ATTENTE", "NON_LUE", sentAt));
    }

    private void createNotificationForConfirmation(Patient patient, RendezVous rdv, LocalDate sentAt) {
        String message = String.format(
                "✅ Confirmation: Votre rendez-vous avec Dr. %s est confirmé pour le %s à %s.",
                rdv.getMedecin().getNomComplet(),
                formatDate(rdv.getDate()),
                rdv.getHeure()
        );
        notificationRepository.save(notification(patient, null, rdv, message, "CONFIRMATION_RDV", "NON_LUE", sentAt));
    }

    private void createNotificationForAnnulation(Patient patient, RendezVous rdv, LocalDate sentAt, String type) {
        String message = String.format(
                "❌ Annulation: Votre rendez-vous du %s à %s avec Dr. %s a été annulé.",
                formatDate(rdv.getDate()),
                rdv.getHeure(),
                rdv.getMedecin().getNomComplet()
        );
        notificationRepository.save(notification(patient, null, rdv, message, type, "LUE", sentAt));
    }

    private void createNotificationForFacture(Patient patient, Consultation c, LocalDate sentAt) {
        String message = String.format(
                "💳 Nouvelle facture: %.2f DHS pour votre consultation avec Dr. %s. Statut: %s",
                c.getMontantTotal(),
                c.getRendezVous().getMedecin().getNomComplet(),
                c.getStatutPaiement()
        );
        notificationRepository.save(notification(patient, null, null, message, "FACTURE", "NON_LUE", sentAt));
    }

    private void createNotificationForNouveauRdvMedecin(Medecin medecin, RendezVous rdv, LocalDate sentAt) {
        String message = String.format(
                "📅 Nouveau rendez-vous: %s le %s à %s. Motif: %s",
                rdv.getPatient().getNomComplet(),
                formatDate(rdv.getDate()),
                rdv.getHeure(),
                rdv.getMotif()
        );
        notificationRepository.save(notification(null, medecin, rdv, message, "NOUVEAU_RDV", "NON_LUE", sentAt));
    }

    private Notification notification(
            Patient patient,
            Medecin medecin,
            RendezVous rdv,
            String message,
            String type,
            String statut,
            LocalDate sentAt
    ) {
        Notification n = new Notification();
        n.setPatient(patient);
        n.setMedecin(medecin);
        n.setRendezVous(rdv);
        n.setMessage(message);
        n.setType(type);
        n.setStatut(statut);
        n.setDateEnvoi(toDate(sentAt));
        if ("LUE".equals(statut)) {
            n.setDateLecture(new Date(n.getDateEnvoi().getTime() + 3_600_000));
        }
        n.setDonnees(null);
        return n;
    }

    private Date toDate(LocalDate localDate) {
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private String formatDate(Date date) {
        return new java.text.SimpleDateFormat("dd/MM/yyyy").format(date);
    }
}
