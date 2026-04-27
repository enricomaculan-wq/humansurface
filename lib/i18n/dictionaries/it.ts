import type { Dictionary } from './en'

export const it: Dictionary = {
  common: {
    brand: 'HumanSurface',
    language: 'Lingua',
    localeName: 'Italiano',
    actions: {
      cancel: 'Annulla',
      close: 'Chiudi',
      contactSupport: 'Contatta il supporto',
      createAccount: 'Crea account',
      login: 'Login',
      logout: 'Logout',
      print: 'Stampa',
      requestCall: 'Richiedi una call',
      saveChanges: 'Salva modifiche',
    },
    status: {
      archived: 'Archiviato',
      completed: 'Completato',
      draft: 'Bozza',
      expired: 'Scaduto',
      failed: 'Fallito',
      inReview: 'In revisione',
      paid: 'Pagato',
      pending: 'In attesa',
      pendingPayment: 'Pagamento in attesa',
      processing: 'In elaborazione',
      published: 'Pubblicato',
      queued: 'In coda',
      running: 'In esecuzione',
      unknown: 'Sconosciuto',
    },
    risk: {
      critical: 'Critico',
      high: 'Alto',
      medium: 'Medio',
      moderate: 'Moderato',
      low: 'Basso',
      unknown: 'Sconosciuto',
    },
  },
  auth: {
    eyebrow: 'Accesso clienti',
    loginTitle: 'Login',
    loginDescription:
      'Accedi al tuo account HumanSurface e consulta lo stato del tuo assessment.',
    signupTitle: 'Crea account',
    signupDescription:
      'Crea il tuo account HumanSurface per accedere allo stato degli assessment e ai report.',
    form: {
      emailLabel: 'Email',
      emailPlaceholder: 'nome@azienda.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'La tua password',
      authFailed: 'Autenticazione non riuscita.',
      invalidCredentials: 'Email o password non corretti.',
      emailNotConfirmed: 'Conferma la tua email prima di accedere.',
      emailAlreadyRegistered:
        'Esiste già un account con questa email. Prova ad accedere.',
      weakPassword: 'Scegli una password più sicura.',
      tooManyAttempts: 'Troppi tentativi. Attendi un momento e riprova.',
      pleaseWait: 'Attendi...',
      loginSubmit: 'Login',
      signupSubmit: 'Crea account',
    },
  },
  buy: {
    eyebrow: 'HumanSurface',
    title: 'Richiedi una call introduttiva HumanSurface',
    description:
      'Raccontaci qualcosa sulla tua azienda e sulle priorità di esposizione. Rivedremo la richiesta e ti ricontatteremo per fissare una breve call introduttiva.',
    expectationTitle: 'Cosa aspettarsi',
    expectationText:
      'HumanSurface è pensato come assessment di esposizione revisionato, non come scansione istantanea a basso valore. Di solito rispondiamo entro 1 giorno lavorativo per capire fit, priorità e prossimi passi.',
    focusTitle: 'Su cosa si concentra HumanSurface',
    focusItems: [
      'Esposizione pubblica che può supportare tentativi di impersonificazione',
      'Segnali che possono facilitare frodi finance e su fatture',
      'Esposizione HR ed executive-targeted per social engineering',
      'Ruoli visibili, canali di contatto e contesto aziendale pubblico',
    ],
    reasonsTitle: 'Perché le aziende prenotano prima una call',
    reasonItems: [
      'Per capire se il servizio è adatto al loro profilo di esposizione',
      'Per allineare priorità e contesto decisionale',
      'Per rivedere output atteso e modalità di delivery',
      'Per mantenere il processo consulenziale e ad alto segnale',
    ],
    deliveryTitle: 'Modello di delivery',
    deliveryText:
      'Ogni assessment viene revisionato prima della pubblicazione per preservare chiarezza, coerenza e valore decisionale. Una breve call introduttiva aiuta a definire lo scope e confermare il passo successivo prima dell’attivazione.',
    formEyebrow: 'Richiedi una call',
    formTitle: 'Prenota una conversazione introduttiva',
    formDescription:
      'Condividi i dati aziendali e una breve descrizione di cosa vuoi valutare. Rivedremo la richiesta e ti contatteremo per organizzare una breve call.',
    form: {
      fullNameLabel: 'Nome e cognome',
      fullNamePlaceholder: 'Esempio: Mario Rossi',
      companyNameLabel: 'Nome azienda',
      companyNamePlaceholder: 'Esempio: HumanSurface Srl',
      domainLabel: 'Dominio aziendale',
      domainPlaceholder: 'esempio.com',
      emailLabel: 'Email di lavoro',
      emailPlaceholder: 'nome@azienda.com',
      roleLabel: 'Ruolo',
      rolePlaceholder: 'Esempio: CEO, IT Manager, CFO',
      companySizeLabel: 'Dimensione azienda',
      companySizePlaceholder: 'Seleziona la dimensione aziendale',
      notesLabel: 'Cosa vorresti valutare?',
      notesPlaceholder: 'Priorità, dubbi, urgenza, contesto aziendale...',
      reviewNotice:
        'Rivediamo ogni richiesta manualmente e di solito rispondiamo entro 1 giorno lavorativo per organizzare una breve call introduttiva.',
      errorFallback: 'Errore durante l’invio della richiesta.',
      networkError: 'Errore di rete. Riprova.',
      fullNameRequired: 'Inserisci nome e cognome.',
      companyNameRequired: 'Inserisci il nome dell’azienda.',
      domainInvalid: 'Inserisci un dominio aziendale valido.',
      emailInvalid: 'Inserisci un’email di lavoro valida.',
      tooManyRequests: 'Troppe richieste. Riprova più tardi.',
      successMessage:
        'Grazie: abbiamo ricevuto la tua richiesta. Ti ricontatteremo a breve per organizzare una call.',
      submit: 'Richiedi una call',
      submitting: 'Invio richiesta...',
    },
  },
  thankYou: {
    eyebrow: 'Richiesta ricevuta',
    title: 'Grazie per la tua richiesta di consulenza',
    intro:
      'La tua richiesta HumanSurface è stata inviata correttamente. Abbiamo ricevuto i dati aziendali e rivedremo il contesto prima di suggerire il prossimo passo.',
    nextTitle: 'Cosa succede ora',
    nextItems: [
      'Rivediamo i dati aziendali inviati.',
      'Ti contattiamo per organizzare una breve call introduttiva.',
      'Se c’è fit, concordiamo insieme scope e prossimi passi.',
    ],
    timingTitle: 'Tempistiche',
    timingItems: [
      'Obiettivo di prima risposta: 1-2 giorni lavorativi.',
      'I tempi di delivery dell’assessment possono variare in base al profilo aziendale.',
    ],
    contactPrefix: 'Per domande, contattaci a',
    importantTitle: 'Importante',
    importantText:
      'Se devi aggiornare il dominio inviato o i dati aziendali, contattaci il prima possibile così possiamo rivedere il contesto corretto.',
    backHome: 'Torna alla homepage',
  },
  legal: {
    eyebrow: 'Legale',
    contactTitle: 'Contatti',
    privacyTitle: 'Informativa Privacy',
    privacySections: [
      {
        title: '1. Titolare del trattamento',
        body: 'HumanSurface tratta dati personali in relazione a richieste di assessment, completamento della fatturazione, supporto clienti ed erogazione del servizio.',
      },
      {
        title: '2. Dati che raccogliamo',
        body: 'Possiamo raccogliere dati di contatto, dati aziendali, informazioni di fatturazione, metadati relativi ai pagamenti e informazioni inviate tramite i form di questo sito.',
      },
      {
        title: '3. Finalità del trattamento',
        body: 'Trattiamo i dati per fornire il servizio HumanSurface, gestire fatturazione e invoicing, comunicare con i clienti, migliorare il servizio e rispettare obblighi di legge.',
      },
      {
        title: '4. Fornitori terzi',
        body: 'I pagamenti possono essere gestiti da Stripe. Hosting, infrastruttura, database e delivery tecnica possono coinvolgere fornitori esterni che operano come responsabili del trattamento.',
      },
      {
        title: '5. Conservazione dei dati',
        body: 'I dati personali sono conservati solo per il tempo necessario a fornire il servizio, gestire obblighi contabili e legali e mantenere registri di servizio.',
      },
      {
        title: '6. Diritti degli utenti',
        body: 'Ove applicabile, gli utenti possono richiedere accesso, rettifica, cancellazione, limitazione, portabilità o opposizione rispetto ai propri dati personali, nei limiti della legge applicabile.',
      },
    ],
    privacyContactIntro: 'Per richieste relative alla privacy, contatta:',
    termsTitle: 'Termini di Servizio',
    termsSections: [
      {
        title: '1. Servizio',
        body: 'HumanSurface fornisce servizi di assessment dell’esposizione focalizzati su visibilità pubblica aziendale, esposizione di persone e ruoli, scenari di phishing e frode e relativa reportistica.',
      },
      {
        title: '2. Natura dell’output',
        body: 'Il servizio supporta consapevolezza, visibilità del rischio e prioritizzazione. Non garantisce l’assenza di problemi di sicurezza, tentativi di frode o attività malevole.',
      },
      {
        title: '3. Tempistiche di delivery',
        body: 'Salvo diverso accordo, l’assessment viene generalmente reso disponibile entro 2 giorni lavorativi dal pagamento e dal completamento delle informazioni di fatturazione richieste.',
      },
      {
        title: '4. Responsabilità del cliente',
        body: 'Il cliente è responsabile di fornire informazioni aziendali, dominio e dati di fatturazione accurati e di garantire che l’assessment richiesto sia lecito e autorizzato.',
      },
      {
        title: '5. Pagamenti e fatturazione',
        body: 'I pagamenti sono raccolti in anticipo. I dati di fatturazione possono essere richiesti dopo il pagamento e prima dell’emissione della fattura.',
      },
      {
        title: '6. Rimborsi',
        body: 'Eventuali richieste di rimborso sono valutate caso per caso, soprattutto quando la delivery del servizio è già iniziata o il lavoro di assessment è già stato svolto.',
      },
      {
        title: '7. Limitazione di responsabilità',
        body: 'Nei limiti massimi consentiti dalla legge, HumanSurface non risponde di danni indiretti, incidentali o consequenziali derivanti dall’uso del servizio o dall’affidamento sugli output dell’assessment.',
      },
    ],
    termsContactIntro: 'Per supporto o richieste legali:',
  },
  assessmentPending: {
    eyebrow: 'Assessment in preparazione',
    title: 'Il tuo assessment HumanSurface è in preparazione',
    intro:
      'Stiamo elaborando l’esposizione pubblica della tua azienda e preparando l’output dell’assessment.',
    deliveryTitle: 'Tempistiche',
    deliveryText:
      'Il report sarà disponibile entro 2 giorni lavorativi. In molti casi, la delivery avviene prima.',
    nextTitle: 'Cosa succede ora',
    nextItems: [
      'Finalizziamo l’elaborazione dell’assessment.',
      'Generiamo il tuo report HumanSurface.',
      'I risultati saranno disponibili appena pronti.',
    ],
    clientAccessTitle: 'Accesso clienti',
    clientAccessText:
      'Per monitorare l’assessment più avanti dall’area clienti, crea un account usando la stessa email utilizzata per la richiesta.',
    referenceLabel: 'Riferimento assessment',
  },
  clientArea: {
    eyebrow: 'Area clienti',
    title: 'I tuoi assessment',
    description:
      'Monitora lo stato di pubblicazione dei tuoi assessment HumanSurface e accedi ai report quando vengono rilasciati.',
    requestAssessment: 'Richiedi assessment',
    noLinkedTitle: 'Nessun account assessment collegato',
    noLinkedText:
      'Questo account non è ancora collegato ad alcun profilo aziendale. Puoi richiedere un nuovo assessment HumanSurface o contattare il supporto se ne hai già richiesto uno con un indirizzo email diverso.',
    paymentLabel: 'Pagamento',
    billingLabel: 'Fatturazione',
    assessmentLabel: 'Assessment',
    createdLabel: 'Creato',
    summaryTitle: 'Riepilogo assessment',
    overallScoreLabel: 'Score complessivo',
    riskLevelLabel: 'Livello di rischio',
    publishedLabel: 'Pubblicato',
    orderRecordedText:
      'Il tuo ordine è stato registrato. L’assessment apparirà qui appena viene creato.',
    viewStatus: 'Vedi stato',
    openReport: 'Apri report',
    anotherEyebrow: 'Ti serve un altro assessment?',
    anotherTitle: 'Richiedi un nuovo assessment HumanSurface',
    anotherText:
      'Puoi richiedere un altro assessment per un’azienda diversa, un dominio diverso o un nuovo ciclo di revisione per la stessa organizzazione.',
    availability: {
      draft:
        'Il tuo assessment è in preparazione. La delivery avviene tipicamente entro 2 giorni lavorativi, spesso prima.',
      inReview:
        'Il tuo assessment è in revisione finale. Il report sarà disponibile al completamento della pubblicazione.',
      published: 'Il report del tuo assessment è ora disponibile.',
      archived:
        'Questo assessment è stato archiviato. Contatta il supporto se ti serve un nuovo ciclo di assessment.',
      unknown: 'Lo stato dell’assessment non è attualmente disponibile.',
    },
  },
  assessmentStatus: {
    eyebrow: 'Stato assessment',
    fallbackTitle: 'Assessment HumanSurface',
    createdLabel: 'Creato',
    referenceTitle: 'Riferimento assessment',
    deliveryTitle: 'Tempistiche',
    contactSupport: 'Contatta il supporto',
    backToClientArea: 'Torna all’area clienti',
    states: {
      draft: {
        eyebrow: 'In preparazione',
        title: 'Il tuo assessment è in preparazione',
        description:
          'Stiamo analizzando l’esposizione pubblica della tua organizzazione e preparando l’output dell’assessment.',
        deliveryText:
          'Ogni assessment viene revisionato prima della pubblicazione. Il report sarà disponibile entro 2 giorni lavorativi, spesso prima.',
      },
      inReview: {
        eyebrow: 'Revisione finale',
        title: 'Il tuo assessment è in revisione finale',
        description:
          'Il report è in fase di finalizzazione per la pubblicazione. Questo passaggio aiuta a garantire un output più chiaro e affidabile.',
        deliveryText:
          'La delivery avviene tipicamente entro 2 giorni lavorativi dal completamento dell’ordine, spesso prima.',
      },
      archived: {
        eyebrow: 'Archiviato',
        title: 'Questo assessment è stato archiviato',
        description:
          'Questo report non è più la versione pubblicata attiva. Contatta il supporto se ti serve assistenza o un nuovo ciclo di assessment.',
      },
    },
  },
  assessmentReport: {
    clientReportEyebrow: 'Report cliente',
    unknownOrganization: 'Organizzazione sconosciuta',
    unknownPerson: 'Persona sconosciuta',
    publishedLabel: 'Pubblicato',
    printReport: 'Stampa report',
    reportEyebrow: 'Report HumanSurface',
    executiveSummaryTitle: 'Executive summary',
    executiveSummarySubtitle:
      'Riepilogo dell’esposizione pubblica che può supportare scenari di phishing, impersonificazione e frode.',
    overallScoreLabel: 'Score complessivo',
    scoreLabels: {
      overall: 'Complessivo',
      impersonation: 'Impersonificazione',
      financeFraud: 'Frode finance',
      hrSocial: 'HR / Social',
    },
    sections: {
      topFindings: 'Finding principali',
      topFindingsSubtitle:
        'Finding a priorità più alta attualmente inclusi nel report.',
      exposedPeople: 'Persone / ruoli più esposti',
      externalExposure: 'Esposizione esterna',
      whatChanged: 'Cosa è cambiato',
      whyThisMatters: 'Perché è importante',
      immediateRecommendations: 'Raccomandazioni immediate',
      strategicRecommendations: 'Raccomandazioni strategiche',
    },
    metrics: {
      externalSourcesScanned: 'Fonti esterne analizzate',
      externalSignalsAccepted: 'Segnali esterni accettati',
      externalPeopleDetected: 'Persone esterne rilevate',
      externalFindings: 'Finding esterni',
      pagesScanned: 'Pagine analizzate',
      peopleDetected: 'Persone rilevate',
      findingsRecorded: 'Finding registrati',
      signalsLinkedToPeople: 'Segnali collegati a persone',
    },
    emptyStates: {
      noFindings: 'Nessun finding disponibile.',
      noPersonScores: 'Nessuno score persona disponibile.',
      noExternalFindings:
        'Nessun finding esterno dedicato è stato renderizzato per questo assessment.',
      initialPublishedVersion: 'Versione pubblicata iniziale.',
    },
    externalSource: 'Fonte esterna',
    externalSourceDomains: 'Domini delle fonti esterne',
    whyThisMattersText:
      'La visibilità pubblica della leadership, i ruoli individuabili esternamente e i segnali di esposizione ripetuti aumentano la credibilità di tentativi di impersonificazione, frode su fatture e social engineering contro la tua organizzazione.',
    executiveSummary: {
      intro:
        'Questo report sintetizza l’esposizione pubblica human-surface attualmente visibile per {organization}.',
      score:
        'Lo score complessivo di esposizione attuale è {score}, con un profilo di rischio {risk}.',
      findings:
        '{count} finding sono stati identificati tra segnali del sito pubblico e fonti esterne che possono supportare scenari di phishing, impersonificazione e frode.',
      noFindings: 'Nessun finding materiale è stato renderizzato in questo report.',
      people:
        '{count} persone o ruoli altamente esposti sono evidenziati per il follow-up operativo.',
      noPeople: 'Nessun highlight di esposizione a livello persona è attualmente disponibile.',
      organizationFallback: 'la tua organizzazione',
    },
    whatChanged: {
      externalSignalsAccepted: '+{count} segnali esterni accettati',
      externalPeopleDetected:
        '+{count} persone o ruoli visibili esternamente rilevati',
      externalFindingsInserted: '+{count} finding esterni generati',
      peopleDetected: '{count} persone o ruoli rilevati complessivamente',
      findingsInserted: '{count} finding registrati in questo assessment',
    },
    fallbackImmediateRecommendations: [
      'Riduci dove possibile l’esposizione pubblica diretta di indirizzi email finance, HR ed executive.',
      'Introduci una verifica secondaria per richieste urgenti di pagamento o modifica delle coordinate bancarie.',
      'Rivedi pagine leadership e team per limitare dettagli non necessari su ruoli e contatti.',
      'Forma personale HR, finance e a contatto con executive sugli scenari di impersonificazione e social engineering.',
      'Monitora fonti esterne in cui possono essere esposti nomi, ruoli e contesto aziendale dello staff.',
    ],
    strategicRecommendations: [
      'Stabilisci un ciclo ricorrente di revisione HumanSurface per i cambiamenti di esposizione pubblica.',
      'Definisci ownership per dettagli pubblici dello staff, visibilità dei ruoli e follow-up di remediation.',
      'Introduci controlli di approvazione per informazioni organizzative e di contatto visibili esternamente.',
      'Traccia i finding ricorrenti nel tempo per misurare la riduzione dell’esposizione.',
    ],
  },
}
