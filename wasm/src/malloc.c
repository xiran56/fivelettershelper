extern unsigned char __heap_base;

unsigned int bump_pointer = (unsigned int)(&__heap_base);

void* malloc(int n) {
  unsigned int r = bump_pointer;
  bump_pointer += n;
  return (void *)r;
}

void clear() {
    bump_pointer = (unsigned int)(&__heap_base);
}
