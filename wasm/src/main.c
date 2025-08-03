#include "words.h"

#define NTH_BIT(num, bit) ((num >> bit) & 1)

#define UNKNOWN_LETTER 32
#define UNCHOSEN_WORD_INDEX WORDS_COUNT

#define KNOWN(x) x != UNKNOWN_LETTER

typedef uint8_t mask_t[WORD_LEN];
typedef uint32_t icorrect_mask_t[WORD_LEN];

uint16_t chosen_word_index = UNCHOSEN_WORD_INDEX;

void calculate_word(int missing_letters, mask_t correct, icorrect_mask_t icorrect) {
    for (uint16_t word_index = 0; word_index < WORDS_COUNT; word_index++) {
        for (uint8_t letter_index = 0; letter_index < WORD_LEN; letter_index++) {
            if (NTH_BIT(missing_letters, words[word_index][letter_index]))
                goto skip;
            
            if (KNOWN(correct[letter_index]) && correct[letter_index] != words[word_index][letter_index])
                goto skip;

            if (NTH_BIT(icorrect[letter_index], words[word_index][letter_index]))
                goto skip;
        }
            
        chosen_word_index = word_index;
        return;
skip:;
    }
} 

void get_word(uint8_t *buf) {
    if (chosen_word_index != UNCHOSEN_WORD_INDEX)
        for (uint8_t i = 0; i < WORD_LEN; i++)
                buf[i] = words[chosen_word_index][i];

    // javascript side sets the answer to [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN], so no need to fill if there isn't a chosen word
}
