/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/diary.json`.
 */
export type Diary = {
  "address": "4qR9hdwNFQu4R23mwF3TcmBhW69qZpFPAVJGjmzsivZ3",
  "metadata": {
    "name": "diary",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createDiaryEntry",
      "discriminator": [
        109,
        17,
        50,
        15,
        134,
        113,
        154,
        122
      ],
      "accounts": [
        {
          "name": "diaryEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteDiaryEntry",
      "discriminator": [
        20,
        159,
        182,
        49,
        14,
        232,
        37,
        193
      ],
      "accounts": [
        {
          "name": "diaryEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateDiaryEntry",
      "discriminator": [
        161,
        119,
        217,
        234,
        73,
        208,
        237,
        162
      ],
      "accounts": [
        {
          "name": "diaryEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "diary_entry.title",
                "account": "diaryEntryState"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "diaryEntryState",
      "discriminator": [
        96,
        145,
        67,
        32,
        176,
        96,
        33,
        62
      ]
    }
  ],
  "types": [
    {
      "name": "diaryEntryState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    }
  ]
};
