LATEXMK = latexmk -pdf -interaction=nonstopmode -halt-on-error -file-line-error

.PHONY: all check clean distclean

all: main.pdf

main.pdf: FORCE
	$(LATEXMK) main.tex

# Fails if the last build left any warning, bad box, or undefined reference.
check: main.pdf
	@if grep -nE 'Warning|Overfull|Underfull|undefined|Missing character' main.log; then \
	  echo "check: FAILED (see lines above)"; exit 1; \
	else echo "check: clean (no warnings, no bad boxes, no undefined refs)"; fi
	@if [ -f main.blg ] && grep -nE '(WARN|ERROR) - ' main.blg \
	    | grep -v 'does not contain any citations'; then \
	  echo "check: biber FAILED"; exit 1; fi

clean:
	latexmk -c main.tex
	rm -f main.bbl main.run.xml chapters/*.aux

distclean: clean
	latexmk -C main.tex

FORCE:
