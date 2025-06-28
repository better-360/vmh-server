import firebaseAdmin from 'firebase-admin';

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: 'skrive-ap',
    clientEmail:
      'firebase-adminsdk-76qd7@skrive-ap.iam.gserviceaccount.com',
    privateKey:
      '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCovOlRtdZnYMQB\nVpypjnRAppA1/P4wsxPYxdR436X3nh29f1vUAMWsdpxCIkl2+70zUigfuKwXUjSy\nLMuh/IaeH4m2QbCMHE4cQkQwuzuzRhiQTruwW8rd10zxHHBf46zKwZA70L9IcwbR\ncGrgVDNjknCR1/ZjAritJuVmi15vcZF/eFGFNixTA1RoTiXp1Qe17m9VJk10gFuW\nNzIHb3abnWk9GRbfRKXBB/OAIVYcKkmSgO1R0FtrtDtTPBA3W5galXP4gS2BoTTb\nf8w0VRAZBypuYPzrc8bRjMMAj4O7KhIidJFpgnWC2Zh93PkNBV4tnT/gBFlCi1vh\nbGQfeQ+5AgMBAAECggEAEuyh/csnJU+719sVBaqvhNcxbg6mWwOgjpOsZ1SM7nsm\nInw7yih+gv/H+V5TTzP/VZfJnnolmdV7Sb7epTeXSPloRl+ya1pa085GS9FZ6hqq\n01dzMx2uYEg+7b026Lg2B0TjdmPsahWVfoyNPgTPgSO5uo+mJ1dVKz1FJeWsVRLw\nem4tRLhOYM0Od/kFirLKqUTrGstf9lGzT9L3s+QH+LPe7OBxuYrwuPmVcjaG0otZ\nmylsifxQUcCtrIDmM4J7QOHU2Wpe43+MF4TELXrLa7T2wun6W+buiEP2E4LP3ywz\nPv9vYRMVGHv/PpW4IBnsAKa5einewRrdRw+wCTlWYQKBgQDtX/4J28u/KDo1c611\nbjnLAwf4lyGvOnOt189DlqtuMU2tL4czoLpzpAC0xEg6Wghu/C99A3nq6QspuJ5k\nDk/1eNtYvYl/MUArwJvHIl7O8F6G1IeZzjAj+csstew/iPPCt0r74gHF7+ORhiOw\nbSRHn5NWAm4Jq8ZhV5RkOzHOmQKBgQC1+j+XBQk7U7Qj0U6FqUTkL8hNOhtjNL7V\nvFdguY9EUWWFLfGlvHNqtay0X2LGRqSmc5wRDiXgdDTR16/Fs74ZsR95NFDu/gXg\nFjuc9OpMaJ0hCwgmK+d3hpCcBruvk1XqlK1TdSzRzxlw0MbxSZnZi1pykxsGzz7V\nTL3BssOeIQKBgQDTrjWx/vLb/fiisAywWuJo2sQh+ExOohaEoZ4wTM2Fj6wQVAEC\nlkOPWmJS0XMDrkQ1DOkgV5hCVx3gT8XXvjep1OPuZ9+UsIvkOHfyhgD8E7iIDkD6\ndLfTbS+1KGqMYgnWy3Ov2WTxabKLlI6BB2NCB9jw62vLbgaTyfEHzQ3miQKBgQCQ\nN4zhwGn6jHF82Unjf6xLMtsI6P3/dzOt659L1oMF34QXMbwKXvkRHn2KTPXYsO+X\nwpNyqMW3xiB+FPMGOVZ0wfxxb9acMNCzMKt5zldIyreMElQY/D5qaUh9fpCLqrYy\nPDXIqFomxHwi/jJL0sqMr3W0y4RltyTSogjYUzXYQQKBgQCW4Xzdwojggxknr30d\nFSQZ9yy6zTK5YUQe1GA5lKVRDPZyTkDvFycMDEZKFiibO748HEAq2cXL9Pwop2O+\nxFEtVFXace6Yf/CJSekok+a1xf+67HXyAWzQVGWc6bSmtp4DGumES+5+kMCM9/i5\nu0eJz1Bw+Rduao6dOqwcE0im8g==\n-----END PRIVATE KEY-----\n',
  }),
  storageBucket:process.env.FIREBASE_STORAGE_BUCKET,
});

export const client_json = {
  type: "service_account",
  project_id: "betterapps-speakwise-ai",
  private_key_id: "bf44f7f1d39aa4683fa81a0b439d8c591efef5e5",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCidMHGFaqD3Hhj\nNv7VYtP177rwsFMwhkcRpAVj0HqcSMvDsIM3ZXIW0Y0AfwZEKirIyHs70XcEMdhf\nEJk0ZfEsTJZiqCGEBJwxx0CJPxR8TwnmC704SnUmJQX5nNscBRvD/X7jaDwqh3hj\nsxor1Fi+mAq5bxzpyBU0mYqLprBE+zTKED76SV7EibVsCVK0ugul71hcwwy1hmUn\nqT523EbuR/PEgimaKsS5xFMijx/zLW9Hs7zjy5JAtkvDXNYtMjlu39b+UCxojy0J\nr0tPOkVACXMOM77b/gg7bbt4xbnwRSlRNl4ZqMB78X0y40QjNZPVnYk8FgBSaeFP\nIJnJUrVDAgMBAAECggEAUF9yZNVgRJeFahSR1DFuS00dECo0Jhwwuf4LepvwpTRw\ntzKzYGtMnBR1bYrqpzuzah2htnEFsGoWscWs/lr3DCMh/dJPrph3TDtXZu9x66RQ\n8eLZ7SkNN192ys07K+wtFfRq3Ag8SBA41B6OcqO+eiEPoTljNRg7wYe7HydLKvzR\nBXzb3xNon46l+6OGmBT2i02yvDs3wlJ4KluMh3/xhP7OcPtHfXjE+eWekp9Fy5vU\nepZhHpSYWFkaIiOYGzfGQitqNSPz/otbGGrk9vBgkhrGVNphvWRqYf8bx0AYsfzZ\nWVhV/0qfJpdQTAgH1G51J1OrdTHKFhRc+dce7+HOVQKBgQDbhNejaxTnDod8Ip9p\n5I81A4hn/MyAxGwTL1EtSujgoa8Tp9PdNfM6uhlGtx86YHa/D0aSBtk9si1KrAFZ\npG6omCfzuxJiV5lba8wQwN0lsfo+vQ3xjj5UrVehNRwwdhwFcwToiLu8+H6Sk0zY\nCuHOYJlY4fiUG112j1xD7bgmpQKBgQC9dD9qKWLfNJ9zXii56bmCXhKNLR7NTfC6\nDM+5cb5LVSQ4RWBiwOZ36KXmoDxO5GhPGC+t9dz2Ma4zPNbpOq6nmxsZhy5SKkM3\npfLyF6r7FO6Ccy34GWFyU7T/XYx1Ur/7K0SHNCQNw5ytPbFKsH698DYcI/1BEzQL\nSnFgBfUPxwKBgG9DAIzqnFiUK6WGYugoGVGUbdHO9tQZOnHq3KkpO6mHKZa7zI1l\nZ9ePNXp7HE/ZTrZ+BpXC9N7pbT1YuwJ1bkTzgeRuH95KagdFNtQS/MO7VovwBJ43\nK259wVmK8rO5WXCFoKo/i3A3PugJ0rv5oAObQH4lYnmm+RM7jFc9qMWlAoGAOku4\n76vIdrI0lkVU9tAKeykDQFmv7rCa8ETc7k0npvqN6JrAa+K7iA4YbnzD0erKhfwF\nP9w1n7PtzGpeHuolsAE0N4i3IiVLBaaUuRW7UQNB2PYkIQF+ULWdLi7U94z88gaA\nUbIjnfChF1WyZi8k8MEnhUU1un50Nz0y4b8zhyUCgYBKo4EDGCFodWbNXhp6bHzx\neq/OUmgXh5aJavTg5feXam76t92gx0XVB/mSC8HVsjlFztAA35/xy757TqkSQGKf\nchcBsmKl0H2hl7gQWALVbPhZXLQtQsdOSwuXknMu+aqyJ83uYnufyN4tjRLwsAy5\newHqXK5sBhs6nsz/J/Z8hg==\n-----END PRIVATE KEY-----\n",
  client_email: "atakan@betterapps-speakwise-ai.iam.gserviceaccount.com",
  client_id: "111665123992020312030",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/atakan%40betterapps-speakwise-ai.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};


export const firebaseMessaging = firebaseAdmin.messaging(firebaseAdmin.app());
