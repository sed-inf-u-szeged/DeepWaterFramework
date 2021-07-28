FROM continuumio/miniconda3
SHELL ["/bin/bash", "-c"]
ENTRYPOINT ["/app/docker-entrypoint.sh"]

WORKDIR /app
COPY env.yml /app
RUN conda env create -f env.yml
COPY . /app

CMD ["python", "dwf_client.py", "--reinit", "--debug"]
