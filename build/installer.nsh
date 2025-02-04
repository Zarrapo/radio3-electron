!macro customHeader
  !define MUI_DIRECTORYPAGE_TEXT_TOP "Seleccione la carpeta de destino para instalar ${PRODUCT_NAME}."
!macroend

!macro customInit
  StrCpy $INSTDIR "$PROGRAMFILES\${PRODUCT_NAME}"
!macroend
