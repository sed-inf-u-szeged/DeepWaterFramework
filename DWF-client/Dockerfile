FROM continuumio/miniconda3
SHELL ["/bin/bash", "-c"]
ENTRYPOINT ["/dwf/client/docker-entrypoint.sh"]

WORKDIR /dwf/client
RUN mkdir /dwf/DeepBugHunter/ &&\
    mkdir /dwf/FeatureAssembler/
COPY env.yml /dwf/client
RUN conda env create -f env.yml
COPY . /dwf/client
RUN chmod +x /dwf/client/docker-entrypoint.sh

CMD ["python", "dwf_client.py", "--reinit", "--debug"]
