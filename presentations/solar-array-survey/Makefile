# Build the deck. `make` produces main.pdf; `make notes` produces a version
# with the speaker notes interleaved after each slide.

MAIN  := main
SRC   := $(MAIN).tex preamble.tex diagrams.tex
AUX   := aux log nav out snm toc vrb

.PHONY: all notes clean

all: $(MAIN).pdf

$(MAIN).pdf: $(SRC)
	pdflatex -interaction=nonstopmode -halt-on-error $(MAIN).tex
	pdflatex -interaction=nonstopmode -halt-on-error $(MAIN).tex

notes: $(SRC)
	sed 's|^% \\setbeameroption{show notes}|\\setbeameroption{show notes}|' \
	    $(MAIN).tex > $(MAIN)-notes.tex
	pdflatex -interaction=nonstopmode -halt-on-error $(MAIN)-notes.tex
	pdflatex -interaction=nonstopmode -halt-on-error $(MAIN)-notes.tex
	rm -f $(MAIN)-notes.tex $(addprefix $(MAIN)-notes.,$(AUX))

clean:
	rm -f $(addprefix $(MAIN).,$(AUX)) $(MAIN)-notes.*
